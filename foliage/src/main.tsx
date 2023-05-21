import React, { ReactNode } from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/login/LoginPage";
import { helpers as userHelpers } from "@/shared/user";

import storage from "./shared/helpers/storage";

import ManageLinksPage from "@/pages/links/ManageLinksPage";
import RegisterPage from "@/pages/register/RegisterPage";
import { useLinksClient } from "@/shared/links";
import { useConst, withSome } from "@bryx-inc/ts-utils";
import { AppShell } from "@mantine/core";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import TopBar from "./shared/TopBar";

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
]);

function Root(props: { children: ReactNode }) {
  useConst(() => {
    useLinksClient.get.init()();
    const jwt = storage.authority.get();

    withSome(jwt, userHelpers.initWithJwt);
  });

  return <>{props.children}</>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root>
      <RouterProvider router={router} />
    </Root>
  </React.StrictMode>
);
