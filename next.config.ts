import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  reactStrictMode: false, //BlockNote는 아직 React 19 / Next 15 StrictMode와 호환되지 않습니다. 지금은 다음에서 StrictMode를 비활성화하세요
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
