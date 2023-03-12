from fastapi import FastAPI
from fastapi.responses import RedirectResponse
import grpc

# codegen
import trunk_pb2
import trunk_pb2_grpc


app = FastAPI()
links = trunk_pb2_grpc.LinksStub(grpc.insecure_channel('api.aspn.app:9000'))


@app.get("/")
async def index():
    return {"ok": True}


@app.get("/search/{username}")
async def resolve_link_query(username: str, q: str):
    try:
        url, *_ = [result.url for result in links.search(trunk_pb2.SearchLinksRequest(
            username=username, query=q)).results]

        return RedirectResponse(url)

    # if we cannot unpack the result list, it must be empty
    except ValueError:
        return RedirectResponse(f"https://www.google.com/search?q={q}")
