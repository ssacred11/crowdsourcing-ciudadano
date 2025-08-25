/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*", // proxy a FastAPI local
      },
    ];
  },
};

module.exports = nextConfig;
