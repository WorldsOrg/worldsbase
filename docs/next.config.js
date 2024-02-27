const withNextra = require("nextra")({
  output: "standalone",
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = withNextra();
