import { getPropertyUnsafe } from "@bryx-inc/ts-utils";
import { StateCreator, StoreApi, UseBoundStore, create } from "zustand";
import { devtools } from "zustand/middleware";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & {
      use: { [K in keyof T]: () => T[K] };
      get: { [K in keyof T]: () => T[K] };
    }
  : never;

export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  store.get = {};

  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    (store.get as any)[k] = () => getPropertyUnsafe(store.getState(), k);
  }
  

  return store;
}

type InferStateCreatorShape<S extends StateCreator<object, [], []>> =
  S extends StateCreator<infer Shape, [], []> ? Shape : never;

type IntersectUnion<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export function constructStoreFromSlices<T extends StateCreator<any>[]>(
  ...stateCreatorSlices: T
) {
  return create<IntersectUnion<InferStateCreatorShape<T[number]>>>()(
    devtools((...args) =>
      stateCreatorSlices.reduce(
        (store, curSlice) => ({
          ...store,
          ...curSlice(...args),
        }),
        {} as IntersectUnion<InferStateCreatorShape<T[number]>> extends object
          ? IntersectUnion<InferStateCreatorShape<T[number]>>
          : never
      )
    )
  );
}
