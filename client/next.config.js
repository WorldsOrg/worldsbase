module.exports = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_PATH ? `${process.env.API_PATH}/:path*` : "http://localhost:3003/api/:path*",
      },
      {
        source: "/composerapi/:path*",
        destination: process.env.COMPOSER_API_PATH ? `${process.env.COMPOSER_API_PATH}/:path*` : "http://localhost:3008/composerapi/:path*",
      },
      {
        source: "/chainapi/:path*",
        destination: process.env.CHAIN_API_PATH ? `${process.env.CHAIN_API_PATH}/:path*` : "http://localhost:3004/chainapi/:path*",
      },
    ];
  },
};
