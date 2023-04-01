#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

protoc \
  --plugin=$(brew --prefix)/opt/swift-protobuf/bin/protoc-gen-swift \
  --swift_opt=Visibility=Public \
  --swift_out=$SCRIPT_DIR/../protobuf \
  --plugin=$(brew --prefix)/opt/grpc-swift/bin/protoc-gen-grpc-swift \
  --grpc-swift_opt=Client=true \
  --grpc-swift_opt=Visibility=Public \
  --grpc-swift_out=$SCRIPT_DIR/../protobuf \
  -I $SCRIPT_DIR/../../protos \
  $SCRIPT_DIR/../../protos/trunk.proto

