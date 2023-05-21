import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";

import { Link, LinksClient, LinksDefinition } from "trunk-proto/trunk";
import { getAuthority } from "./getAuthority";
import { Maybe, isNone } from "@bryx-inc/ts-utils";
import { createSelectors } from "./helpers/zustand";

type LinksGrpcState = {
  client: Maybe<LinksClient>;
};

type LinksGrpcActions = {
  init: () => void;

  //

  removeKeyword: (link: Link, keyword: string) => Promise<void>;
  getAllKeywords: () => Promise<string[]>;
};

export type LinksGrpcStore = LinksGrpcState & LinksGrpcActions;

export const useLinksClient = createSelectors(
  create<LinksGrpcStore>()(
    immer((set, get) => ({
      client: null,

      init: () =>
        set((store) => {
          const channel = createChannel("https://trunk.aspn.app");
          store.client = createClient(LinksDefinition, channel);
        }),

      removeKeyword: async (link, keyword) => {
        const authority = getAuthority();
        const { client } = get();

        if (isNone(client) || !authority) return;

        await client.update({
          authority,
          linkId: link.id,
          update: {
            keywords: link.keywords.filter((e) => e != keyword),
          },
        });
      },

      getAllKeywords: async () => {
        const authority = getAuthority();
        const { client } = get();

        if (isNone(authority) || isNone(client)) return [];

        const { results } = await client.get_all({ authority });
        return results.flatMap((link) => link.keywords);
      },
    }))
  )
);