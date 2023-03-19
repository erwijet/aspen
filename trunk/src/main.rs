use async_once::AsyncOnce;
use db::AspenDB;
use lazy_static::lazy_static;

use proto::{authorization_server::AuthorizationServer, links_server::LinksServer};
use tonic::transport::Server;

use services::{authorization::AuthorizationService, links::LinksService};
use tower_http::trace::{DefaultMakeSpan, DefaultOnFailure, DefaultOnResponse, TraceLayer};
use tracing::Level;

pub mod proto {
  tonic::include_proto!("aspen.trunk");
}

mod db;
mod helpers;
mod jwt;

mod services {
  pub mod authorization;
  pub mod links;
}

lazy_static! {
  pub static ref DB: AsyncOnce<AspenDB> = AsyncOnce::new(async { AspenDB::init().await.unwrap() });
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let addr = "0.0.0.0:9000".parse().unwrap();

  tracing_subscriber::fmt().with_target(false).compact().init();

  let auth_svc = tonic_web::config()
    .allow_all_origins()
    .enable(AuthorizationServer::new(AuthorizationService::default()));

  let links_svc =
    tonic_web::config().allow_all_origins().enable(LinksServer::new(LinksService::default()));

  Server::builder()
    .accept_http1(true)
    .layer(
      TraceLayer::new_for_grpc()
        .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
        .on_response(DefaultOnResponse::new().level(Level::INFO))
        .on_failure(DefaultOnFailure::new().level(Level::INFO)),)
    .add_service(auth_svc)
    .add_service(links_svc)
    .serve(addr)
    .await?;

  Ok(())
}
