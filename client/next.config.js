module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3003/:path*",
      },
      {
        source: "/composerapi/:path*",
        destination: "http://localhost:3008/:path*",
      },
    ];
  },
};
