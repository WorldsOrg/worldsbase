module.exports = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://server:3003/:path*",
      },
      {
        source: "/composerapi/:path*",
        destination: "http://localhost:3008/:path*",
      },
    ];
  },
};
