import React, { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/login/LoginPage";
import { helpers as userHelpers } from "@/shared/user";

import localstorage from "./shared/helpers/localstorage";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RegisterPage from "@/pages/register/RegisterPage";
import ConsolePage from "@/pages/console/ConsolePage";
import { useLinksClient } from "@/shared/clients/links";
import ManageLinksPage from "@/pages/manage/links/ManageLinksPage";
import { AppShell } from "@mantine/core";
import { SideBar } from "./shared/SideBar";
import TopBar from "./shared/TopBar";

useLinksClient.getState().init();

function createPage(
  elem: JSX.Element,
  opts: { header?: boolean; sidebar?: boolean }
) {
  return (
    <AppShell
      header={opts.header ? <TopBar /> : <></>}
      navbar={opts.sidebar ? <SideBar /> : <></>}
    >
      {elem}
    </AppShell>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate replace to="/landing" />,
  },
  {
    path: "/landing",
    element: createPage(<LandingPage />, { header: true }),
  },
  {
    path: "/login",
    element: createPage(<LoginPage />, { header: true }),
  },
  {
    path: "/register",
    element: createPage(<RegisterPage />, { header: true }),
  },
  {
    path: "/console",
    element: createPage(<ConsolePage />, { header: true, sidebar: true }),
  },
  {
    path: "/links",
    element: createPage(<ManageLinksPage />, { header: true, sidebar: true }),
  },
]);

function Root(props: { children: ReactNode }) {
  useEffect(() => {
    const jwt = localstorage.authority.get();
    if (!jwt) return;

    userHelpers.initWithJwt(jwt);
  }, []);

  return <>{props.children}</>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root>
      <RouterProvider router={router} />
    </Root>
  </React.StrictMode>
);
