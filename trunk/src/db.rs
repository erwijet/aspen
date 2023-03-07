use std::{env, io::Read, str::FromStr};

use mongodb::{
  bson::{doc, oid::ObjectId},
  options::{
    ClientOptions, DeleteOptions, FindOneAndDeleteOptions, FindOneOptions, InsertOneOptions,
  },
  results::{DeleteResult, InsertOneResult},
  Client, Collection,
};
use serde::{de::IntoDeserializer, Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Serialize, Deserialize, Debug)]
pub struct Link {
  id: String,
  url: String,
  keywords: Vec<String>,
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
