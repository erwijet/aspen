use sha2::{Digest, Sha256};
use tonic::{Request, Response, Status};

use crate::{
  jwt::Signable,
  proto::{
    authorization_server::Authorization, AuthResponse, Authority, CloseAccountRequest,
    CreateAccountRequest, Empty, LoginRequest,
  },
  DB
};

#[macro_use]
use crate::authority_sub;

#[derive(Debug, Default)]
pub struct AuthorizationService {}

#[tonic::async_trait]
impl Authorization for AuthorizationService {
  async fn create_account(
    &self,
    req: Request<CreateAccountRequest>,
  ) -> Result<Response<AuthResponse>, Status> {
    let CreateAccountRequest { username, first_name, last_name, password, .. } = req.into_inner();
    let acct = DB
      .get()
      .await
      .create_account(username, first_name, last_name, password)
      .await
      .map_err(|err| Status::internal(format!("{:?}", err)))?;

    Ok(Response::new(AuthResponse { authority: Some(Authority::new(acct)) }))
  }

  async fn log_in(&self, req: Request<LoginRequest>) -> Result<Response<AuthResponse>, Status> {
    let LoginRequest { username, password } = req.into_inner();

    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    let sha256 = format!("{:X}", hasher.finalize());

    let acct = DB
      .get()
      .await
      .get_account(&username, &sha256)
      .await
      .map_err(|err| Status::internal(format!("{:?}", err)))?;

    Ok(Response::new(AuthResponse { authority: { acct.map(|acct| Authority::new(acct)) } }))
  }

  async fn close_account(
    &self,
    req: Request<CloseAccountRequest>,
  ) -> Result<Response<Empty>, Status> {
    let CloseAccountRequest { authority } = req.into_inner();
    // let id = match authority {
    //   None => Err(Status::unauthenticated("No authority specified")),
    //   Some(authority) => authority
    //     .get_account_id()
    //     .ok_or(Status::permission_denied("Invalid or insufficient authority")),
    // }?;



    let id = authority_sub!(authority);

    DB.get()
      .await
      .delete_account(&id)
      .await
      .map_err(|err| Status::internal(format!("{:?}", err)))?
      .ok_or(Status::not_found("Valid authority but no account"))?;

    Ok(Response::new(Empty {}))
  }
}
