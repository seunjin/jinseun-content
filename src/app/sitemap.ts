import { fetchPostsServer } from "@features/posts/server";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * @description 사이트맵(sitemap.xml)을 생성합니다.
 * - 루트 페이지와 공개된 게시글 상세 페이지를 포함합니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
  ];

  try {
    const posts = await fetchPostsServer({ onlyPublished: true });

    posts.forEach((post) => {
      routes.push({
        url: `${siteUrl}/post/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
      });
    });
  } catch {
    // 게시글 조회 실패 시 루트 경로만 포함한 사이트맵을 반환합니다.
  }

  return routes;
}
