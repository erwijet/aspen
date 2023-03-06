use std::env;

use lazy_static::lazy_static;
use tonic::{Request, Response, Status};

use crate::{
  jwt::Signable,
  proto::{
    authorization_server::Authorization, AuthResponse, Authority, CloseAccountRequest,
    CreateAccountRequest, Empty, LoginRequest,
  },
  DB,
};

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
    Ok(Response::new(AuthResponse { authority: { None } }))
  }

  async fn close_account(
    &self,
    req: Request<CloseAccountRequest>,
  ) -> Result<Response<Empty>, Status> {
    Ok(Response::new(Empty {}))
  }
}
