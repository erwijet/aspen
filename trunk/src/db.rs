use futures::StreamExt;
use std::{env, io::Read, str::FromStr};

use mongodb::{
  bson::{doc, document::Iter, from_document, oid::ObjectId, Bson, Document},
  options::{
    AggregateOptions, ClientOptions, DeleteOptions, FindOneAndDeleteOptions, FindOneOptions,
    InsertOneOptions,
  },
  results::{DeleteResult, InsertOneResult},
  Client, Collection,
};
use serde::{de::IntoDeserializer, Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::proto;

#[derive(Serialize, Deserialize, Debug)]
pub struct Link {
  _id: String,
  account_id: String,
  url: String,
  keywords: Vec<String>,
}

impl Into<proto::Link> for Link {
  fn into(self) -> proto::Link {
    proto::Link { id: self._id, url: self.url, keywords: self.keywords }
  }
}

impl Into<Link> for Document {
  fn into(self) -> Link {
    Link {
      _id: self.get_object_id("_id").unwrap().to_string(),
      account_id: self.get_str("account_id").unwrap().to_string(),
      url: self.get_str("url").unwrap().to_string(),
      keywords: self
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
    account_id: String,
  ) -> Result<Vec<Link>, mongodb::error::Error> {
    let mut cursor = self
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
              "account_id": account_id
            }
          },
          doc! {
            "$limit": 10
          },
        ],
        AggregateOptions::default(),
      )
      .await?;

    let mut links = vec![];

    while let Some(doc) = cursor.next().await {
      links.push(doc?.into());
    }

    Ok(links)
  }
}
