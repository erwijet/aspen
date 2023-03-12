## twig - The Aspen HTTP-based interface

### Running Locally

```
# install poetry
$ curl -sSL https://install.python-poetry.org | python3 -

# clone the repo
$ git clone git@github.com:erwijet/aspen && cd aspen/twig

# install dependencies
$ poetry install

# generate protobuf stubs
$ poetry run python3 \
    -m grpc_tools.protoc \
    -I ../protos \
    --python_out=. \
    --pyi_out=. \
    --grpc_python_out=. \
    ../protos/trunk.proto

# run the server
$ poetry run python3 -m uvicorn main:app --reload
```

Then, navigate to `http://localhost:8000/search/{aspen_username}?q=<query>`
