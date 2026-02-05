import { createPostsApi } from "@features/posts/api";
import { fetchPostBySlugServer } from "@features/posts/server";
import { createServerSupabase } from "@shared/lib/supabase/server.supabase";
import { formatYmd } from "@shared/utils/date";
import BlockNoteToc from "@ui/components/editor/BlockNoteToc";
import BlockNoteViewerClient from "@ui/components/editor/BlockNoteViewer.client";
import PageContainer from "@ui/layouts/PageContainer";
import { Separator } from "@ui/shadcn/components";
import type { Metadata } from "next";
import Image from "next/image";

type PublicPostDetailPageProps = {
  /**
   * @description URL 파라미터에서 전달된 게시글 슬러그입니다.
   */
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteTitle = "Jinseun Dev Blog";
const siteDescription =
  "새로운 기술을 탐구하고 직접 구현해보는 과정, 문제 해결 경험, 프로젝트 회고, 그리고 나만의 개발 철학을 정리합니다.";
const authorName = "Jinseun";

/**
 * @description 게시글 상세 페이지용 메타데이터를 생성합니다.
 * - 게시글이 존재하지 않거나 비공개인 경우 기본 블로그 메타데이터를 반환합니다.
 * - description은 게시글 설명이 있으면 우선 사용하고, 없으면 블로그 한 줄 소개를 사용합니다.
 * - keywords 컬럼이 있으면 그대로 메타 키워드로 반영합니다.
 */
export const generateMetadata = async ({
  params,
}: PublicPostDetailPageProps): Promise<Metadata> => {
  try {
    const resolvedParams = await params;
    const supabase = await createServerSupabase();
    const postsApi = createPostsApi(supabase);
    const post = await postsApi.fetchPostBySlug(resolvedParams.slug);

    if (!post || !post.isPublished) {
      return {
        title: `게시글을 찾을 수 없습니다 | ${siteTitle}`,
        description: siteDescription,
      };
    }

    const baseTitle = post.title;
    const fullTitle = `${baseTitle} | ${siteTitle}`;
    const description = post.description ?? siteDescription;
    const canonicalUrl = `${siteUrl}/post/${post.slug}`;

    return {
      title: fullTitle,
      description,
      keywords: post.keywords ?? undefined,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: baseTitle,
        description,
        url: canonicalUrl,
        type: "article",
        images: [
          {
            url: post.thumbnailUrl ?? "/og-default.png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: baseTitle,
        description,
        images: [post.thumbnailUrl ?? "/og-default.png"],
      },
    };
  } catch {
    return {
      title: siteTitle,
      description: siteDescription,
    };
  }
};

/**
 * @description 공개용 게시글 상세 페이지입니다.
 * - 이미 발행된 게시글만 노출되며, 공개/비공개 라벨과 상단 툴바는 표시하지 않습니다.
 */
const PublicPostDetailPage = async ({ params }: PublicPostDetailPageProps) => {
  const resolvedParams = await params;
  const post = await fetchPostBySlugServer(resolvedParams.slug);

  // 발행되지 않았거나 존재하지 않는 게시글은 노출하지 않습니다.
  if (!post || !post.isPublished) {
    return (
      <PageContainer.Default>게시글을 찾을 수 없습니다.</PageContainer.Default>
    );
  }

  const createdYmd = formatYmd(post.createdAt ?? undefined);
  const canonicalUrl = `${siteUrl}/post/${post.slug}`;
  const rawThumbnailUrl = post.thumbnailUrl ?? "/og-default.png";
  const imageUrl =
    rawThumbnailUrl.startsWith("http://") ||
    rawThumbnailUrl.startsWith("https://")
      ? rawThumbnailUrl
      : `${siteUrl}${rawThumbnailUrl}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description ?? siteDescription,
    image: [imageUrl],
    datePublished: post.createdAt ?? undefined,
    dateModified: post.updatedAt ?? post.createdAt ?? undefined,
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <PageContainer.WithSidebar
      className="--sidebar-width: 15rem"
      sidebarPostion="right"
      sidebarComponent={<BlockNoteToc />}
    >
      <article className="mx-auto flex flex-col gap-6">
        <header className="space-y-3 text-left">
          {/* 타이틀 */}
          <h1 className="text-4xl font-semibold tracking-tight break-keep leading-[1.3]">
            {post.title}
          </h1>

          {/* 설명(옵션) */}
          {post.description && (
            <p className="text-lg text-muted-foreground break-keep">
              {post.description}
            </p>
          )}

          {/* 키워드 */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-2 text-sm text-muted-foreground">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center rounded-full border px-2 py-0.5"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* 공개 여부 · 날짜 */}
          <div className="flex items-center justify-end gap-3">
            {createdYmd && (
              <span className="text-sm text-muted-foreground/50">
                {createdYmd}
              </span>
            )}
          </div>
        </header>

        <Separator className="bg-foreground/10" />

        {/* 썸네일 */}
        {post.thumbnailUrl && (
          <div className="w-full overflow-hidden rounded-xl border bg-muted/20">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              width={1200}
              height={800}
              className="w-full h-auto object-contain max-h-[70vh] mx-auto"
              sizes="(min-width: 1200px) 1056px, (min-width: 768px) calc(100vw - 48px), 100vw"
              priority
            />
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* BlockNote 기반 본문(content) 뷰어 */}
          <section className="page-content-viwer flex-1">
            <BlockNoteViewerClient
              contentJson={post.content ?? undefined}
              className="px-0"
            />
          </section>
        </div>

        {/* 검색 엔진을 위한 BlogPosting JSON-LD 구조화 데이터 */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      </article>
    </PageContainer.WithSidebar>
  );
};

export default PublicPostDetailPage;
