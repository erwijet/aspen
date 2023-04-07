import React from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/login/LoginPage";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import RegisterPage from "./pages/register/RegisterPage";
import { useAuthClient } from "./shared/auth";
import ConsolePage from "./pages/console/ConsolePage";
import { useLinksClient } from "./shared/links";
import ManageLinksPage from "./pages/manage/links/ManageLinksPage";

useAuthClient.getState().init();
useLinksClient.getState().init();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate replace to="/landing" />,
  },
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/console",
    element: <ConsolePage />,
  },
  {
    path: "/manage/links",
    element: <ManageLinksPage />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
