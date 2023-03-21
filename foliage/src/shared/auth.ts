import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createChannel, createClient } from "nice-grpc-web";
import { decode } from "jsonwebtoken";

import {
  AuthorizationClient,
  AuthorizationDefinition,
} from "trunk-proto/trunk";
import { useNavigate } from "react-router-dom";

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

export const useAuthClient = create<AuthGrpcStore>()(
  immer((set) => ({
    ready: false,
    init: () =>
      set((store) => {
        const channel = createChannel("https://trunk.aspn.app");
        store.client = createClient(AuthorizationDefinition, channel);
        store.ready = true;
      }),
    client: null,
  }))
);

export const useSession = () => {
  const nav = useNavigate();
  const tok = getAuthToken();

  const empty = { authed: false } as const;

  if (tok == null) return empty;

  const decoded = decode(tok);
  if (typeof decoded != "object" || decoded == null) return empty;

  if (parseInt(decoded?.exp?.toString() ?? "0") > +new Date()) return empty;

  const firstname: string = decoded["firstname"];
  const lastname: string = decoded["lastname"];
  const username: string = decoded["usr"];

  return {
    authed: true,
    firstname,
    lastname,
    username,
    authority: { jwt: tok },
  } as const;
};

export const setAuthToken = (tok: string) => {
  localStorage.setItem("app.aspn.authority", tok);
};

export const getAuthToken = () => {
  return localStorage.getItem("app.aspn.authority");
};
