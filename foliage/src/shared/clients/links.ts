import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";

import { Link, LinksClient, LinksDefinition } from "trunk-proto/trunk";
import { Option } from "prelude-ts";
import { getAuthority } from "../getAuthority";

type LinksGrpcState = {
  ready: boolean;
  client: Option<LinksClient>;
};

type LinksGrpcActions = {
  init: () => void;

  //

  removeKeyword: (link: Link, keyword: string) => Promise<void>;
  createLink: (link: Link) => Promise<void>;
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
      const authority = getAuthority();
      const { client } = useLinksClient.getState();

      if (client.isNone() || !authority) return;

      await client.get().update({
        authority,
        linkId: link.id,
        update: {
          keywords: link.keywords.filter((e) => e != keyword),
        },
      });
    },

    createLink: async (link) => {
      const authority = getAuthority();
      const { client } = useLinksClient.getState();

      if (client.isNone() || !authority) return;

      await client.get().create({
        authority,
        ...link,
      });
    },
  }))
);
