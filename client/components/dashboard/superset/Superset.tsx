"use client";
import { useEffect } from "react";
import axios from "axios";
import { embedDashboard, EmbedDashboardParams } from "@superset-ui/embedded-sdk";
import styles from "./page.module.css";

const Superset = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchGuestTokenFromBackend = async () => {
    const loginTokenResponse = await axios.get("/api/superset");

    return loginTokenResponse.data.token;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Null checks for process.env.SUPERSET_DASHBOARD_ID and document.getElementById("supersetContainer")
      if (!document.getElementById("supersetContainer")) {
        console.error("Invalid SUPERSET_DASHBOARD_ID or supersetContainer element not found");
        return;
      }

      const guestToken = await fetchGuestTokenFromBackend();

      const embedParams: EmbedDashboardParams = {
        id: "e945218d-02c7-4058-a6dd-faf7ecf8a719",
        supersetDomain: "https://superset.worlds.org",
        mountPoint: document.getElementById("supersetContainer")!,
        fetchGuestToken: () => guestToken,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          hideTab: true,
          filters: {
            expanded: false,
          },
        },
      };

      embedDashboard(embedParams);
    };

    fetchData();
  }, []);

  return <div id="supersetContainer" className={styles.supersetContainer} />;
};

export default Superset;
