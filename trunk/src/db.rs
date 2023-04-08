use futures::{StreamExt, TryStreamExt};
use std::{env, str::FromStr};

use mongodb::{
  bson::{doc, oid::ObjectId, Document},
  options::{
    AggregateOptions, ClientOptions, FindOneAndDeleteOptions, FindOneOptions, InsertOneOptions,
  },
  results::{DeleteResult, UpdateResult},
  Client, Collection,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::proto;

#[derive(Serialize, Deserialize, Debug)]
pub struct Link {
  pub _id: String,
  pub account: String,
  pub url: String,
  pub keywords: Vec<String>,
  pub name: String,
  pub hits: u32
}

impl Link {
  pub fn from_proto_link(proto_link: proto::Link, username: String) -> Self {
    Self {
      _id: proto_link.id,
      account: username,
      keywords: proto_link.keywords,
      url: proto_link.url,
      name: proto_link.name,
      hits: proto_link.hits
    }
  }
}

impl From<Link> for proto::Link {
  fn from(link: Link) -> Self {
    Self { id: link._id, url: link.url, keywords: link.keywords, hits: link.hits, name: link.name }
  }
}

impl From<Link> for Document {
  fn from(link: Link) -> Self {
    let _id = ObjectId::from_str(&link._id).unwrap();

    doc! {
      "_id": _id,
      "account": link.account,
      "url": link.url,
      "keywords": link.keywords
    }
  }
}

impl From<Document> for Link {
  fn from(doc: Document) -> Self {
    Self {
      _id: doc.get_object_id("_id").unwrap().to_string(),
      account: doc.get_str("account").unwrap().to_string(),
      url: doc.get_str("url").unwrap().to_string(),
      name: doc.get_str("name").unwrap().to_string(),
      hits: u32::try_from(doc.get_i32("hits").unwrap()).unwrap(),
      keywords: doc
        .get_array("keywords")
        .unwrap()
        .into_iter()
        .map(|subobj| subobj.as_str().unwrap().to_owned())
        .collect(),
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Account {
  pub _id: ObjectId,
  pub username: String,
  pub first_name: String,
  pub last_name: String,
  sha256: String,
}

pub struct AspenDB {
  client: Client,
}

impl AspenDB {
  pub async fn init() -> Result<Self, mongodb::error::Error> {
    let mut opts = ClientOptions::parse(
      env::var("MONGO_CONNECTION_STR").expect("couldn't find $MONGO_CONNECTION_STR"),
    )
    .await?;

    opts.app_name = Some("aspen-trunk".into());
    Ok(Self { client: Client::with_options(opts)? })
  }

  fn collection<T>(&self, coll: &str) -> Collection<T> {
    self.client.database("aspen".into()).collection(coll)
  }
}

impl AspenDB {
  pub async fn create_account(
    &self,
    username: String,
    first_name: String,
    last_name: String,
    password: String,
  ) -> Result<Account, mongodb::error::Error> {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());

    let sha256 = format!("{:X}", hasher.finalize());
    let acct = Account { _id: ObjectId::new(), first_name, last_name, sha256, username };

    self.collection::<Account>("accounts").insert_one(&acct, InsertOneOptions::default()).await?;
    Ok(acct)
  }

  pub async fn get_account_by_username(
    &self,
    username: &str,
  ) -> Result<Option<Account>, mongodb::error::Error> {
    let res = self
      .collection::<Account>("accounts")
      .find_one(
        doc! {
          "username": username
        },
        None,
      )
      .await?;

    Ok(res)
  }

  pub async fn get_account(
    &self,
    username: &str,
    sha256: &str,
  ) -> Result<Option<Account>, mongodb::error::Error> {
    let res = self
      .collection::<Account>("accounts")
      .find_one(doc! { "username": username, "sha256": sha256 }, FindOneOptions::default())
      .await?;
    Ok(res)
  }

  pub async fn delete_account(&self, id: &str) -> Result<Option<Account>, mongodb::error::Error> {
    let res = self
      .collection::<Account>("accounts")
      .find_one_and_delete(
        doc! { "_id": ObjectId::from_str(id).unwrap() },
        FindOneAndDeleteOptions::default(),
      )
      .await?;

    Ok(res)
  }
}

impl AspenDB {
  pub async fn search_links(
    &self,
    query: String,
    username: String,
  ) -> Result<Vec<Link>, mongodb::error::Error> {
    let results: Vec<Link> = self
      .collection::<Link>("links")
      .aggregate(
        vec![
          doc! {
            "$search": {
              "index": "links",
              "text": {
                "path": {
                  "wildcard": "*"
                },
                "query": query
              }
            }
          },
          doc! {
            "$match": {
              "account": username
            }
          },
          doc! {
            "$limit": 10
          },
        ],
        AggregateOptions::default(),
      )
      .await?
      .into_stream()
      .map_ok(|doc| doc.into())
      .try_collect()
      .await?;

    Ok(results)
  }

  pub async fn get_link(&self, _id: ObjectId) -> Result<Option<Link>, mongodb::error::Error> {
    // let res = self
    //   .collection::<Link>("links")
    //   .find_one(doc! { "_id": ObjectId::from_str(&link_id).unwrap() }, None)
    //   .await?;

    self
      .collection::<Link>("links")
      .aggregate(
        vec![
          doc! {
            "$match": {
              "_id": _id
            }
          },
          doc! {
            "$limit": 1
          },
        ],
        AggregateOptions::default(),
      )
      .await?
      .next()
      .await
      .transpose()
      .map(|inner| inner.map(Link::from))
  }

  pub async fn get_all_links(&self, username: &str) -> Result<Vec<Link>, mongodb::error::Error> {
    let results: Vec<Link> = self
      .collection::<Link>("links")
      .aggregate(
        vec![doc! {
          "$match": {
            "account": username
          }
        }],
        AggregateOptions::default(),
      )
      .await?
      .into_stream()
      .map_ok(Document::into)
      .try_collect()
      .await?;

    Ok(results)
  }

  pub async fn create_link(
    &self,
    username: &str,
    url: &str,
    keywords: &Vec<String>,
    name: &str
  ) -> Result<Link, mongodb::error::Error> {
    let res = self
      .collection("links")
      .insert_one(
        doc! {
          "account": username,
          "url": url,
          "keywords": keywords
        },
        None,
      )
      .await?;

    Ok(Link {
      _id: res.inserted_id.to_string(),
      account: username.to_owned(),
      url: url.to_owned(),
      keywords: keywords.clone(),
      name: name.to_string(),
      hits: 0
    })
  }

  pub async fn update_link(
    &self,
    link: crate::db::Link,
  ) -> Result<UpdateResult, mongodb::error::Error> {
    let link_id = ObjectId::from_str(&link._id).unwrap();

    let res = self
      .collection::<Link>("links")
      .update_one(
        doc! { "_id": link_id },
        doc! {
          "$set": {
            "url": link.url,
            "keywords": link.keywords
          }
        },
        None,
      )
      .await?;

    Ok(res)
  }

  pub async fn delete_link(&self, _id: &ObjectId) -> Result<DeleteResult, mongodb::error::Error> {
    self.collection::<Link>("links").delete_one(doc! { "_id": _id }, None).await
  }
}
