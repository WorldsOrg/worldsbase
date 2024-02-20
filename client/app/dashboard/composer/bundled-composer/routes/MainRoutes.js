import { lazy } from "react";

// project imports
import MainLayout from "../layout/MainLayout";
import Loadable from "../ui-component/Loadable";

// workflows routing
const Workflows = Loadable(lazy(() => import("../views/workflows")));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/flows",
      element: <Workflows />,
    }
  ],
};

export default MainRoutes;
