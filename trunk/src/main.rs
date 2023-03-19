use async_once::AsyncOnce;
use db::AspenDB;
use lazy_static::lazy_static;

use proto::{authorization_server::AuthorizationServer, links_server::LinksServer};
use tonic::{transport::Server, codegen::http::Method};

use services::{authorization::AuthorizationService, links::LinksService};
use tower::ServiceBuilder;
use tower_http::{trace::TraceLayer, cors::{CorsLayer, Any}};

pub mod proto {
  tonic::include_proto!("aspen.trunk");
}

mod db;
mod jwt;
mod helpers;

mod services {
  pub mod authorization;
  pub mod links;
}

lazy_static! {
  pub static ref DB: AsyncOnce<AspenDB> = AsyncOnce::new(async {
    AspenDB::init().await.unwrap()
  });
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let addr = "0.0.0.0:9000".parse().unwrap();

  Server::builder()
    .layer(TraceLayer::new_for_grpc())
    .layer(CorsLayer::new().allow_origin(Any).allow_methods([Method::POST, Method::OPTIONS]))
    .add_service(AuthorizationServer::new(AuthorizationService::default()))
    .add_service(LinksServer::new(LinksService::default()))
    .serve(addr)
    .await?;

  Ok(())
}
