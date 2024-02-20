"use client";

// style + assets
import "./bundled-composer/assets/scss/style.scss";
import { lazy } from "react";

import { ThemeProvider } from "@mui/material/styles";
import { useSelector } from "react-redux";

// project imports
import Loadable from "./bundled-composer/ui-component/Loadable";
import themes from "./bundled-composer/themes";

const Workflows = Loadable(lazy(() => import("./bundled-composer/views/workflows")));

function WorkflowsPage() {
  //@ts-ignore
  const customization = useSelector((state) => state.customization);

  return (
    <ThemeProvider theme={themes(customization)}>
      <Workflows />
    </ThemeProvider>
  );
}

export default WorkflowsPage;
