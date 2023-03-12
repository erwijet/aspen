FROM docker.io/python:3.11-bullseye
WORKDIR /twig

RUN pip3 install poetry
RUN poetry config virtualenvs.create false

COPY protos /protos
COPY twig /twig

RUN poetry install
RUN poetry run python3 \
    -m grpc_tools.protoc \
    -I ../protos \
    --python_out=. \
    --pyi_out=. \
    --grpc_python_out=. \
    ../protos/trunk.proto

CMD ["poetry", "run", "python3", "-m", "uvicorn", "main:app"]
