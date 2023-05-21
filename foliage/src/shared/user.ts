import { useLinksClient } from "@/shared/links";
import { getAuthority } from "@/shared/getAuthority";
import storage from "@/shared/helpers/storage";
import {
  constructStoreFromSlices,
  createSelectors,
} from "@/shared/helpers/zustand";
import { dedupArr, flatMapIntoDeepKey, isNone, pipe } from "@bryx-inc/ts-utils";
import { decode } from "jsonwebtoken";
import { createChannel, createClient } from "nice-grpc-web";
import { AuthorizationDefinition } from "trunk-proto/trunk";
import { combine } from "zustand/middleware";

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
  (_set) => ({})
);

export const useUserStore = createSelectors(
  constructStoreFromSlices(
    createBasicUserInfoSlice,
    createKeywordsUserSlice,
    createGrpcAuthClientSlice
  )
);

export const helpers = {
  logout() {
    const setBasicUserInfo = useUserStore.get.setBasicUserInfo();
    const setUserKeywords = useUserStore.get.setUserKeywords();

    localStorage.removeItem("app.aspn.authority");

    storage.authority.set(null);
    setBasicUserInfo("", "", "");
    setUserKeywords([]);
  },

  initWithJwt(jwt: string) {
    const setBasicUserInfo = useUserStore.get.setBasicUserInfo();

    const decoded = decode(jwt);
    if (typeof decoded != "object" || decoded == null)
      return console.warn("initWithJwt skipped due to bad jwt: " + jwt);

    if (parseInt(decoded?.exp?.toString() ?? "0") > +new Date())
      return console.warn("initWithJwt skipped due to expired jwt: " + jwt);

    const firstname: string = decoded["firstname"];
    const lastname: string = decoded["lastname"];
    const username: string = decoded["usr"];

    storage.authority.set(jwt);

    setBasicUserInfo(firstname, lastname, username);
    helpers.refreshUserKeywords(); // fire and forget
  },

  async refreshUserKeywords() {
    const setUserKeywords = useUserStore.get.setUserKeywords();
    const client = useLinksClient.get.client();

    const authority = getAuthority();

    if (isNone(authority) || isNone(client)) return;

    pipe(
      (await client.get_all({ authority })).results,
      (arr) => flatMapIntoDeepKey(arr, "keywords"),
      dedupArr,
      setUserKeywords
    );
  },
};
