use sha2::{Digest, Sha256};
use tonic::{Request, Response, Status};

use crate::{
  jwt::{JwtSubject, Signable},
  proto::{
    authorization_server::Authorization, AuthResponse, Authority, CloseAccountRequest,
    CreateAccountRequest, Empty, LoginRequest,
  },
  DB, check_field,
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

    check_field!(username);
    check_field!(first_name);
    check_field!(last_name);
    check_field!(password);

    let acct = DB
      .get()
      .await
      .create_account(username.clone(), first_name, last_name, password)
      .await
      .map_err(|err| match *err.kind {
        mongodb::error::ErrorKind::Write(mongodb::error::WriteFailure::WriteError(
          mongodb::error::WriteError { code: 11000, .. },
        )) => Status::already_exists(format!("username '{}' already exists", username)),
        _ => Status::internal(format!("{:?}", err)),
      })?;

    Ok(Response::new(AuthResponse { authority: Some(Authority::new(acct)) }))
  }

  async fn log_in(&self, req: Request<LoginRequest>) -> Result<Response<AuthResponse>, Status> {
    let LoginRequest { username, password } = req.into_inner();

    check_field!(username);
    check_field!(password);

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

    let id = authority.sub()?;

    DB.get()
      .await
      .delete_account(&id)
      .await
      .map_err(|err| Status::internal(format!("{:?}", err)))?
      .ok_or(Status::not_found("Valid authority but no account"))?;

    Ok(Response::new(Empty {}))
  }
}
