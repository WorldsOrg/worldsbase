module.exports = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aceternity.com",
        port: "",
      },
    ],
  },
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
