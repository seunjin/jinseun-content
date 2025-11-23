import { fetchPostsServer } from "@features/posts/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * @description RSS 2.0 피드를 생성해 반환합니다.
 * - 공개된 최신 게시글 목록을 기준으로 rss.xml을 구성합니다.
 */
export async function GET() {
  const posts = await fetchPostsServer({
    onlyPublished: true,
    limit: 30,
  });

  const itemsXml = posts
    .map((post) => {
      const link = `${siteUrl}/post/${post.slug}`;
      const title = escapeXml(post.title);
      const description = escapeXml(post.description ?? "");
      const pubDate = post.createdAt
        ? new Date(post.createdAt).toUTCString()
        : new Date().toUTCString();

      return [
        "<item>",
        `<title>${title}</title>`,
        `<link>${link}</link>`,
        `<guid>${link}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        description ? `<description>${description}</description>` : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Jinseun Dev Blog</title>
    <link>${siteUrl}</link>
    <description>새로운 기술을 탐구하고 직접 구현해보는 과정, 문제 해결 경험, 프로젝트 회고, 그리고 나만의 개발 철학을 정리합니다.</description>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
