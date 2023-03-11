use std::ops::Deref;

use actix_web::dev::Response;
use actix_web::error::ErrorInternalServerError;
use actix_web::web::Redirect;
use actix_web::Either;
use actix_web::{get, http::StatusCode, web, App, HttpResponse, HttpServer, Responder};
use proto::links_client::{self, LinksClient};
use proto::SearchLinksRequest;
use serde::Deserialize;
use tonic::{client, Request};

pub mod proto {
    tonic::include_proto!("aspen.trunk");
}

// let mut client = AuthorizationClient::connect("api.aspn.app:9000").await?;

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
}

#[get("/search/{usr}")]
async fn link_resolver(usr: web::Path<String>, qry: web::Query<SearchQuery>) -> impl Responder {
    let client = LinksClient::connect("http://api.aspn.app:9000").await;

    let res = client
        .unwrap()
        .search(Request::new(SearchLinksRequest {
            username: usr.into_inner(),
            query: qry.into_inner().q,
        }))
        .await
        .map(|res| {
            HttpResponse::TemporaryRedirect()
                .insert_header((
                    "location",
                    res.into_inner()
                        .results
                        .deref()
                        .first()
                        .unwrap()
                        .url
                        .to_owned(),
                ))
                .finish()
        }).unwrap();

    res

    // match client {
    //     Ok(_) => HttpResponse::TemporaryRedirect()
    //         .insert_header(("location", "//www.google.com"))
    //         .finish(),
    //     Err(_) => HttpResponse::InternalServerError().body(format!(
    //         "Failed to establish connection to gRPC aspen.trunk.LinksService (tried {})",
    //         "api.aspn.app:9000"
    //     )),
    // }

    // match client {
    //     Ok(client) => "ok".to_owned(),
    //     Err(_) => ErrorInternalServerError("nope")
    // }

    // let res = client
    //     .search(Request::new(SearchLinksRequest {
    //         query: q,
    //         username: usr,
    //     }))
    //     .await;

    // format!("search links for user '{}' with query '{}'", usr, qry.q)
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(link_resolver))
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}
