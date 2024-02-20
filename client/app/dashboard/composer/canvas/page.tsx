"use client";
// style + assets
import "../bundled-composer/assets/scss/style.scss";

import dynamic from 'next/dynamic';

import { ThemeProvider } from "@mui/material/styles";
import { useSelector } from "react-redux";

// project imports
import themes from "../bundled-composer/themes";

const Canvas = dynamic(() => import('../bundled-composer/views/canvas'), {
  loading: () => <p>Loading...</p>,
  ssr: false // canvas uses a lot of react-heavy document based code, so turn off ssr
});

function CanvasPage() {
  //@ts-ignore
  const customization = useSelector((state) => state.customization);

  return (
    <ThemeProvider theme={themes(customization)}>
      <Canvas />
    </ThemeProvider>
  );
}

export default CanvasPage;
