use tonic::{Request, Response, Status};

use crate::proto::{
  authorization_server::Authorization, AuthResponse, CloseAccountRequest, CreateAccountRequest,
  Empty, LoginRequest,
};

#[derive(Debug, Default)]
pub struct AuthorizationService {}

#[tonic::async_trait]
impl Authorization for AuthorizationService {
  async fn create_account(
    &self,
    req: Request<CreateAccountRequest>,
  ) -> Result<Response<AuthResponse>, Status> {
    Ok(Response::new(AuthResponse { authority: { None } }))
  }

  async fn log_in(&self, req: Request<LoginRequest>) -> Result<Response<AuthResponse>, Status> {
    Ok(Response::new(AuthResponse { authority: { None } }))
  }

  async fn close_account(
    &self,
    req: Request<CloseAccountRequest>,
  ) -> Result<Response<Empty>, Status> {
    Ok(Response::new(Empty { }))
  }
}
