use tonic::{Request, Response, Status};

use crate::proto::{
  links_server::Links, CreateLinkRequest, CreateLinkResponse, DeleteLinkRequest, Empty,
  SearchLinksRequest, SearchLinksResponse, UpdateLinkRequest, UpdateLinkResponse,
};

#[derive(Debug, Default)]
pub struct LinksService {}

#[tonic::async_trait]
impl Links for LinksService {
    async fn search(&self, req: Request<SearchLinksRequest>) -> Result<Response<SearchLinksResponse>, Status> {
        Err(Status::unimplemented("TODO"))
    }

    async fn update(&self, req: Request<UpdateLinkRequest>) -> Result<Response<UpdateLinkResponse>, Status> {
        Err(Status::unimplemented("TODO"))
    }

    async fn delete(&self, req: Request<DeleteLinkRequest>) -> Result<Response<Empty>, Status> {
        Err(Status::unimplemented("TODO"))
    }

    async fn create(&self, req: Request<CreateLinkRequest>) -> Result<Response<CreateLinkResponse>, Status> {
        Err(Status::unimplemented("TODO"))
    }
}
