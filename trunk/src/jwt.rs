use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use lazy_static::lazy_static;
use sha2::Sha256;
use std::collections::BTreeMap;
use std::env;

use crate::{db::Account, proto::Authority};

lazy_static! {
  static ref JWT_SECRET: Hmac<Sha256> = {
    let secret = env::var("JWT_SECRET").expect("Couldn't find $JWT_SECRET");
    Hmac::<Sha256>::new_from_slice(secret.as_bytes()).unwrap()
  };
}

pub trait Signable {
  fn new(account: Account) -> Self;
  fn get_account_id(&self) -> Option<String>;
}

impl Signable for Authority {
  fn new(account: Account) -> Self {
    let mut claims = BTreeMap::new();

    claims.insert("id", account._id.to_string());
    claims.insert("username", account.username);
    claims.insert("first_name", account.first_name);
    claims.insert("last_name", account.last_name);

    Self { jwt: claims.sign_with_key(&*JWT_SECRET).unwrap() }
  }

  fn get_account_id(&self) -> Option<String> {
    self
      .jwt
      .verify_with_key(&*JWT_SECRET)
      .ok()
      .map(|claims: BTreeMap<String, String>| claims.get("id").unwrap().into())
  }
}
