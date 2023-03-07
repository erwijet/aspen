use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use lazy_static::lazy_static;
use sha2::Sha256;
use std::env;
use std::{collections::BTreeMap, time::SystemTime};
use tonic::Status;

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
    let ts = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();

    claims.insert("sub", account._id.to_string());
    claims.insert("usr", account.username);
    claims.insert("iss", "trunk".into());
    claims.insert("iat", ts.to_string());
    claims.insert("exp", (ts + (60 * 60 * 2)).to_string());
    claims.insert("firstname", account.first_name);
    claims.insert("lastname", account.last_name);

    Self { jwt: claims.sign_with_key(&*JWT_SECRET).unwrap() }
  }

  fn get_account_id(&self) -> Option<String> {
    self
      .jwt
      .verify_with_key(&*JWT_SECRET)
      .ok()
      .map(|claims: BTreeMap<String, String>| claims.get("sub").unwrap().into())
  }
}

pub trait JwtSubject {
  fn sub(&self) -> Result<String, Status>;
}

impl<T> JwtSubject for Option<T>
where
  T: Signable,
{
  fn sub(&self) -> Result<String, Status> {
    match self {
      None => Err(Status::unauthenticated("No authority specified")),
      Some(signable) => signable
        .get_account_id()
        .ok_or(Status::permission_denied("Invalid or insufficient authority")),
    }
  }
}
