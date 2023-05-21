const KEYS = ["authority", "scheme"] as const;

export default KEYS.reduce(
  (actions, k) => ({
    ...actions,
    [k]: {
      get() {
        return localStorage.getItem("app.aspn." + k);
      },
      set(value: string | null) {
        if (value == null) localStorage.removeItem("app.aspn." + k);
        else localStorage.setItem("app.aspn." + k, value);
      },
    },
  }),
  {} as {
    [k in typeof KEYS[number] & string]: {
      get: () => string | null;
      set: (value: string | null) => void;
    };
  }
);
