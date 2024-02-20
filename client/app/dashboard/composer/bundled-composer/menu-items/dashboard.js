// assets
import { IconHierarchy, IconEditCircle, IconWallet, IconKey, IconChartDots2, IconPlugConnected, IconDatabase, IconMoneybag, IconExternalLink } from "@tabler/icons";

// constant
const icons = { IconHierarchy, IconEditCircle, IconWallet, IconKey, IconChartDots2, IconPlugConnected, IconDatabase, IconMoneybag, IconExternalLink };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: "dashboard",
  title: "",
  type: "group",
  children: [
    {
      id: "flows",
      title: "Flows",
      type: "item",
      url: "/flows",
      icon: icons.IconHierarchy,
      breadcrumbs: true,
    },
    {
      id: "database",
      title: "Database",
      type: "item",
      url: "/database",
      icon: icons.IconDatabase,
      breadcrumbs: true,
    },
    {
      id: "economy",
      title: "Economy Analytics",
      type: "item",
      url: "/economy",
      icon: icons.IconMoneybag,
      breadcrumbs: true,
    },
    {
      id: "analytics",
      title: "API Analytics",
      type: "item",
      url: "/analytics",
      icon: icons.IconChartDots2,
      breadcrumbs: true,
    },
    {
      id: "readme",
      title: "API Explorer",
      type: "item",
      url: "https://worlds.readme.io/reference/",
      external: true,
      target: true,
      icon: icons.IconExternalLink,
      breadcrumbs: true,
    },
  ],
};

export default dashboard;
