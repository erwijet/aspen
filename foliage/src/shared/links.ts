import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";

import { LinksClient, LinksDefinition } from "trunk-proto/trunk";

export type LinksGrpcStore =
  | {
      ready: false;
      init: () => void;
      client: null;
    }
  | {
      ready: true;
      init: () => void;
      client: LinksClient;
    };

export const useLinksClient = create<LinksGrpcStore>()(
  immer((set) => ({
    ready: false,
    init: () =>
      set((store) => {
        const channel = createChannel("https://trunk.aspn.app");
        store.client = createClient(LinksDefinition, channel);
        store.ready = true;
      }),
    client: null,
  }))
);
