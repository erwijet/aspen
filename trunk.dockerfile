FROM rust:bullseye
WORKDIR /trunk

COPY ./trunk /trunk
COPY ./protos /protos

RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v22.0/protoc-22.0-linux-x86_64.zip && unzip protoc-22.0-linux-x86_64.zip -d $HOME/.local

RUN PATH="$PATH:$HOME/.local/bin" && cargo build --release
CMD ["./target/release/trunk"]
