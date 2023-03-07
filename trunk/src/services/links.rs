use tonic::{Request, Response, Status};

use crate::{
  jwt::JwtSubject,
  proto::{
    links_server::Links, CreateLinkRequest, CreateLinkResponse, DeleteLinkRequest, Empty,
    SearchLinksRequest, SearchLinksResponse, UpdateLinkRequest, UpdateLinkResponse,
  },
  DB,
};

#[derive(Debug, Default)]
pub struct LinksService {}

#[tonic::async_trait]
impl Links for LinksService {
  async fn search(
    &self,
    req: Request<SearchLinksRequest>,
  ) -> Result<Response<SearchLinksResponse>, Status> {
    let SearchLinksRequest { authority, query, .. } = req.into_inner();
    let id = authority.sub()?;

    let results = DB
      .get()
      .await
      .search_links(query, id)
      .await
      .map_err(|err| Status::internal(format!("{:?}", err)))?;

    Ok(Response::new(SearchLinksResponse {
      results: results.into_iter().map(|link| link.into()).collect(),
    }))
  }

  async fn update(
    &self,
    req: Request<UpdateLinkRequest>,
  ) -> Result<Response<UpdateLinkResponse>, Status> {
    Err(Status::unimplemented("TODO"))
  }

  async fn delete(&self, req: Request<DeleteLinkRequest>) -> Result<Response<Empty>, Status> {
    Err(Status::unimplemented("TODO"))
  }

  async fn create(
    &self,
    req: Request<CreateLinkRequest>,
  ) -> Result<Response<CreateLinkResponse>, Status> {
    Err(Status::unimplemented("TODO"))
  }
}
