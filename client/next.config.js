module.exports = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_PATH}/:path*`,
      },
      {
        source: "/composerapi/:path*",
        destination: `${process.env.NEXT_PUBLIC_COMPOSER_API_PATH}/:path*`,
      },
      {
        source: "/chainapi/:path*",
        destination: `${process.env.NEXT_PUBLIC_CHAIN_API_PATH}/:path*`,
      },
    ];
  },
};
