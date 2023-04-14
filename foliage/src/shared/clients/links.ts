import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";

import {
  Authority,
  Link,
  LinksClient,
  LinksDefinition,
} from "trunk-proto/trunk";
import { Option } from "prelude-ts";
import { IconRuler } from "@tabler/icons-react";
import { useAuthClient } from "./auth";
import { getAuthToken } from "./auth";

type LinksGrpcState = {
  ready: boolean;
  client: Option<LinksClient>;
};

type LinksGrpcActions = {
  init: () => void;

  //

  removeKeyword: (link: Link, keyword: string) => Promise<void>;
};

export type LinksGrpcStore = LinksGrpcState & LinksGrpcActions;

export const useLinksClient = create<LinksGrpcStore>()(
  immer((set) => ({
    ready: false,
    client: Option.none(),

    init: () =>
      set((store) => {
        const channel = createChannel("https://trunk.aspn.app");
        store.client = Option.some(createClient(LinksDefinition, channel));
        store.ready = true;
      }),

    removeKeyword: async (link, keyword) => {
      const jwt = getAuthToken();
      if (!jwt) return;

      const { client } = useLinksClient.getState();
      if (client.isNone()) return;

      const authority = Authority.create({ jwt });

      client.get().update({
        authority,
        linkId: link.id,
        update: {
          keywords: link.keywords.filter((e) => e != keyword),
        },
      });
    },
  }))
);
