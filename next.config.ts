import type { NextConfig } from "next";

// Supabase Storage(로컬/프로덕션)에서 제공하는 이미지 도메인을 Next Image에 허용합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  [
    {
      protocol: "https",
      hostname: "github.com",
    },
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
    },
    // 로컬 Supabase Storage (docker-compose 기본 포트 54321)
    {
      protocol: "http",
      hostname: "localhost",
      port: "54321",
    },
    // 기본 Supabase Storage 호스트(프로젝트별 서브도메인 허용)
    {
      protocol: "https",
      hostname: "**.supabase.co",
    },
  ];

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    imageRemotePatterns.push({
      protocol: "https",
      hostname,
    });
  } catch {
    // 유효하지 않은 URL이면 추가 패턴 없이 진행합니다.
  }
}

const nextConfig: NextConfig = {
  /* config options here */

  reactStrictMode: false, //BlockNote는 아직 React 19 / Next 15 StrictMode와 호환되지 않습니다. 지금은 다음에서 StrictMode를 비활성화하세요
  images: {
    remotePatterns: imageRemotePatterns,
  },
};

export default nextConfig;
