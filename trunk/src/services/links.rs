use tonic::{Request, Response, Status};

use crate::{
  check_field,
  db::Link,
  jwt::JwtSubject,
  proto::{
    self, links_server::Links, CreateLinkRequest, CreateLinkResponse, DeleteLinkRequest, Empty,
    GetAllLinksRequest, LinksResponse, SearchLinksRequest, UpdateLinkRequest, UpdateLinkResponse,
  },
  DB,
};

trait IntoStatus {
  fn into_status(self) -> Status;
}

impl IntoStatus for mongodb::error::Error {
  fn into_status(self) -> Status {
    Status::internal(format!("{:?}", self))
  }
}

#[derive(Debug, Default)]
pub struct LinksService {}

#[tonic::async_trait]
impl Links for LinksService {
  async fn search(
    &self,
    req: Request<SearchLinksRequest>,
  ) -> Result<Response<LinksResponse>, Status> {
    let SearchLinksRequest { username, query, .. } = req.into_inner();

    check_field!(username);
    check_field!(query);

    let results =
      DB.get().await.search_links(query, username).await.map_err(IntoStatus::into_status)?;

    Ok(Response::new(LinksResponse {
      results: results.into_iter().map(|link| link.into()).collect(),
    }))
  }

  async fn get_all(
    &self,
    req: Request<GetAllLinksRequest>,
  ) -> Result<Response<LinksResponse>, Status> {
    let GetAllLinksRequest { authority } = req.into_inner();
    let username = authority.usr()?;

    let results: Vec<proto::Link> = DB
      .get()
      .await
      .get_all_links(&username)
      .await
      .map_err(IntoStatus::into_status)?
      .into_iter()
      .map(Link::into)
      .collect();

    Ok(Response::new(LinksResponse { results }))
  }

  async fn update(
    &self,
    req: Request<UpdateLinkRequest>,
  ) -> Result<Response<UpdateLinkResponse>, Status> {
    let UpdateLinkRequest { authority, link_id, update } = req.into_inner();

    check_field!(link_id);

    if update.is_none() {
      return Err(Status::invalid_argument("no update specified"));
    }

    let username = authority.usr()?;

    let link = DB
      .get()
      .await
      .get_link(&link_id)
      .await
      .map_err(IntoStatus::into_status)?
      .ok_or(Status::not_found(format!("not found: {}", link_id)))?;

    if link.account != username {
      return Err(Status::permission_denied("no ownership"));
    }

    let proto::Link { id, keywords: update_keywords, url: update_url } = update.unwrap();

    if !id.is_empty() && id != link_id {
      return Err(Status::failed_precondition("id is an immutable field"));
    }

    let res = DB
      .get()
      .await
      .update_link(Link {
        _id: link_id,
        account: username,
        url: match update_url {
          url if !url.is_empty() => url,
          _ => link.url,
        },
        keywords: match update_keywords {
          keywords if keywords.len() > 0 => keywords,
          _ => link.keywords,
        },
      })
      .await
      .map_err(IntoStatus::into_status)?;

    Ok(Response::new(UpdateLinkResponse {
      documents_updated: res.modified_count.try_into().unwrap(),
    }))
  }

  async fn delete(&self, req: Request<DeleteLinkRequest>) -> Result<Response<Empty>, Status> {
    let DeleteLinkRequest { authority, link_id } = req.into_inner();
    let username = authority.usr()?;

    check_field!(link_id);

    let link = DB
      .get()
      .await
      .get_link(&link_id)
      .await
      .map_err(IntoStatus::into_status)?
      .ok_or(Status::not_found(format!("not found: {}", link_id)))?;

    if link.account != username {
      return Err(Status::permission_denied("no ownership"));
    }

    DB.get().await.delete_link(&link_id).await.map_err(IntoStatus::into_status)?;

    Ok(Response::new(Empty {}))
  }

  async fn create(
    &self,
    req: Request<CreateLinkRequest>,
  ) -> Result<Response<CreateLinkResponse>, Status> {
    let CreateLinkRequest { authority, url, keywords } = req.into_inner();
    let username = authority.usr()?;

    check_field!(url);

    let link = DB
      .get()
      .await
      .create_link(&username, &url, &keywords)
      .await
      .map_err(IntoStatus::into_status)?;

    Ok(Response::new(CreateLinkResponse { link: Some(link.into()) }))
  }
}
