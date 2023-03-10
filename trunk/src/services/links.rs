use tonic::{Request, Response, Status};

use crate::{
  db::Link,
  jwt::JwtSubject,
  proto::{
    self, links_server::Links, CreateLinkRequest, CreateLinkResponse, DeleteLinkRequest, Empty,
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
    let SearchLinksRequest { username, query, .. } = req.into_inner();

    let results = DB
      .get()
      .await
      .search_links(query, username)
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
    let UpdateLinkRequest { authority, link_id, update } = req.into_inner();

    if update.is_none() {
      return Err(Status::invalid_argument("no update specified"));
    }

    let username = authority.usr()?;

    let link = DB
      .get()
      .await
      .get_link(&link_id)
      .await
      .map_err(|err| Status::internal(format!("{}", err)))?
      .ok_or(Status::not_found(format!("not found: {}", link_id)))?;

    if link.account != username {
      return Err(Status::permission_denied("no ownership"));
    }

    let proto::Link { id, keywords, url } = update.unwrap();

    if id != link_id {
      return Err(Status::invalid_argument("_id mutations not permitted"));
    }

    let res = DB
      .get()
      .await
      .update_link(Link { _id: id, url, keywords, account: username })
      .await
      .map_err(|err| Status::internal(format!("{}", err)))?;

    Ok(Response::new(UpdateLinkResponse { link: Some(res.into()) }))
  }

  async fn delete(&self, req: Request<DeleteLinkRequest>) -> Result<Response<Empty>, Status> {
    let DeleteLinkRequest { authority, link_id } = req.into_inner();
    let username = authority.usr()?;

    let link = DB
      .get()
      .await
      .get_link(&link_id)
      .await
      .map_err(|err| Status::internal(format!("{}", err)))?
      .ok_or(Status::not_found(format!("not found: {}", link_id)))?;

    if link.account != username {
      return Err(Status::permission_denied("no ownership"));
    }

    DB.get()
      .await
      .delete_link(&link_id)
      .await
      .map_err(|err| Status::internal(format!("{}", err)))?;

    Ok(Response::new(Empty {}))
  }

  async fn create(
    &self,
    req: Request<CreateLinkRequest>,
  ) -> Result<Response<CreateLinkResponse>, Status> {
    let CreateLinkRequest { authority, url, keywords } = req.into_inner();
    let account_id = authority.sub()?;

    let link = DB
      .get()
      .await
      .create_link(&account_id, &url, &keywords)
      .await
      .map_err(|err| Status::internal(format!("{}", err)))?;

    Ok(Response::new(CreateLinkResponse { link: Some(link.into()) }))
  }
}
