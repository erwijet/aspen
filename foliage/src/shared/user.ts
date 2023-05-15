import { combine } from "zustand/middleware";
import { Authority, AuthorizationDefinition } from "trunk-proto/trunk";
import {
  constructStoreFromSlices,
  createSelectors,
} from "@/shared/helpers/zustand";
import { useLinksClient } from "./clients/links";
import { createChannel, createClient } from "nice-grpc-web";
import { decode } from "jsonwebtoken";
import localstorage from "./helpers/localstorage";

const createBasicUserInfoSlice = combine(
  { firstName: "", lastName: "", username: "" },
  (set) => ({
    setBasicUserInfo: (firstName: string, lastName: string, username: string) =>
      set(() => ({ firstName, lastName, username })),
  })
);

const createKeywordsUserSlice = combine(
  { keywords: new Array<string>() },
  (set) => ({
    setUserKeywords: (keywords: string[]) => set(() => ({ keywords })),
  })
);

const createGrpcAuthClientSlice = combine(
  {
    client: createClient(
      AuthorizationDefinition,
      createChannel("https://trunk.aspn.app")
    ),
  },
  (set) => ({})
);

export const useUserStore = createSelectors(
  constructStoreFromSlices(
    createBasicUserInfoSlice,
    createKeywordsUserSlice,
    createGrpcAuthClientSlice,
  )
);

export const helpers = {
  logout() {
    const { setBasicUserInfo, setUserKeywords } = useUserStore.getState();
    localStorage.removeItem("app.aspn.authority");

    localstorage.authority.set(null);
    setBasicUserInfo("", "", "");
    setUserKeywords([]);
  },

  initWithJwt(jwt: string) {
    const { setBasicUserInfo } = useUserStore.getState();

    const decoded = decode(jwt);
    if (typeof decoded != "object" || decoded == null)
      return console.warn("initWithJwt skipped due to bad jwt: " + jwt);

    if (parseInt(decoded?.exp?.toString() ?? "0") > +new Date())
      return console.warn("initWithJwt skipped due to expired jwt: " + jwt);

    const firstname: string = decoded["firstname"];
    const lastname: string = decoded["lastname"];
    const username: string = decoded["usr"];

    localstorage.authority.set(jwt);

    setBasicUserInfo(firstname, lastname, username);

    helpers.refreshUserKeywords(); // fire and forget
  },

  getAuthority(): Authority | null {
    const jwt = localstorage.authority.get();
    if (jwt == null) return null;
    else return Authority.create({ jwt });
  },

  async refreshUserKeywords() {
    const { setUserKeywords } = useUserStore.getState();
    const { client } = useLinksClient.getState();
    const authority = this.getAuthority();

    if (!authority) return;

    client.ifSome(({ get_all }) => {
      get_all({ authority }).then(({ results }) =>
        setUserKeywords(
          results
            .map((link) => link.keywords)
            .flat()
            .filter((v, i, arr) => arr.indexOf(v) == i) // dedup
        )
      );
    });
  },
};
