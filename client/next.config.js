module.exports = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_PATH}/:path*`,
      },
      {
        source: "/composerapi/:path*",
        destination: `${process.env.COMPOSER_API_PATH}/:path*`,
      },
      {
        source: "/chainapi/:path*",
        destination: `${process.env.CHAIN_API_PATH}/:path*`,
      },
    ];
  },
};
