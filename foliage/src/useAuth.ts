import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";

import {
  AuthorizationClient,
  AuthorizationDefinition,
} from "trunk-proto/trunk";

export type AuthGrpcStore =
  | {
      ready: false;
      init: () => void;
      client: null;
    }
  | {
      ready: true;
      init: () => void;
      client: AuthorizationClient;
    };

export const useAuth = create<AuthGrpcStore>()(
  immer((set) => ({
    ready: false,
    init: () =>
      set((store) => {
        const channel = createChannel(
          "http://aspn-trunk-grpc.erwijet.com:9000"
        );
        store.client = createClient(AuthorizationDefinition, channel);
        store.ready = true;
      }),
    client: null,
  }))
);
