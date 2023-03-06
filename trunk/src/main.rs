use proto::{links_server::LinksServer, authorization_server::AuthorizationServer};
use tonic::transport::Server;

use services::{authorization::AuthorizationService, links::LinksService};

pub mod proto {
  tonic::include_proto!("aspen");
}

mod services {
  pub mod authorization;
  pub mod links;
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let addr = "[::1]:9000".parse().unwrap();

  Server::builder()
    .add_service(AuthorizationServer::new(AuthorizationService::default()))
    .add_service(LinksServer::new(LinksService::default()))
    .serve(addr)
    .await?;

  Ok(())
}
