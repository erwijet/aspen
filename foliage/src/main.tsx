import React, { ReactNode, useState } from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/login/LoginPage";
import { helpers as userHelpers } from "@/shared/user";

import storage from "./shared/helpers/storage";

import ManageLinksPage from "@/pages/links/ManageLinksPage";
import RegisterPage from "@/pages/register/RegisterPage";
import { useLinksClient } from "@/shared/links";
import { useConst, useDefer, withSome } from "@bryx-inc/ts-utils";
import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import TopBar from "./shared/TopBar";
import { color } from "framer-motion";
import HowItWorksPage from "./pages/howitworks/HowItWorks";

function createPage(elem: JSX.Element) {
  return <AppShell header={<TopBar />}>{elem}</AppShell>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate replace to="/landing" />,
  },
  {
    path: "/landing",
    element: createPage(<LandingPage />),
  },
  {
    path: "/login",
    element: createPage(<LoginPage />),
  },
  {
    path: "/register",
    element: createPage(<RegisterPage />),
  },
  {
    path: "/links",
    element: createPage(<ManageLinksPage />),
  },
  {
    path: "/how",
    element: createPage(<HowItWorksPage />)
  }
]);

function Root(props: { children: ReactNode }) {
  useConst(() => {
    useLinksClient.get.init()();
    const jwt = storage.authority.get();

    withSome(jwt, userHelpers.initWithJwt);
  });

  const colorScheme = (storage.scheme.get() ?? "light") as "light" | "dark";

  // since our state is not reactive, we wrap in `useDefer` since calls to the method `useDefer` produces always trigger a rerender

  const toggleColorScheme = useDefer((value?: ColorScheme) => {
    const newTheme = value ?? (colorScheme == "dark" ? "light" : "dark");
    storage.scheme.set(newTheme);
  });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        {props.children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root>
      <RouterProvider router={router} />
    </Root>
  </React.StrictMode>
);
