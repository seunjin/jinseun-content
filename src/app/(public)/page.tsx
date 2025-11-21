import { fetchCategoryBySlugServer } from "@features/categories/server";
import type { PostRow } from "@features/posts/schemas";
import { fetchPostsServer } from "@features/posts/server";
import type { PostSummary } from "@features/posts/types";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import CategoryMobileFilter from "@ui/layouts/app-sidebar/CategoryMobileFilter";
import CategorySidebar from "@ui/layouts/app-sidebar/CategorySidebar";
import PageContainer from "@ui/layouts/PageContainer";

const mapPostRowToSummary = (row: PostRow): PostSummary => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  keywords: row.keywords,
  // TODO: 카테고리 이름은 추후 조인으로 채웁니다.
  categoryName: undefined,
  thumbnailUrl: row.thumbnailUrl,
  isPublished: row.isPublished,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

type PublicRootPageProps = {
  /**
   * @description URL 쿼리 스트링으로 전달되는 검색 파라미터입니다.
   * - category: 카테고리 슬러그(예: "frontend", "til")
   */
  searchParams: Promise<{
    category?: string;
  }>;
};

const PubliRootPage = async ({ searchParams }: PublicRootPageProps) => {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;

  const category = categorySlug
    ? await fetchCategoryBySlugServer(categorySlug)
    : null;

  const posts = await fetchPostsServer({
    onlyPublished: true,
    ...(category ? { categoryId: category.id } : {}),
  });

  const items = posts.map(mapPostRowToSummary);

  return (
    <PageContainer.WithSidebar
      sidebarComponent={
        <CategorySidebar basePath="/" activeSlug={categorySlug} />
      }
    >
      {/* --- 메인 컨텐츠 영역 --- */}
      <div className="flex flex-col gap-6 sm:gap-10">
        {/* 블로그 / 카테고리 소개 인용문 섹션 */}
        <section className="relative overflow-hidden border-b border-foreground/10 ">
          <div className="relative space-y-2 mb-6">
            {category ? (
              <>
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  {" "}
                  WORK LOG · DEV NOTES
                </p>
                <p className="text-base font-medium text-foreground">
                  {category.name.toUpperCase()}{" "}
                </p>
                <p className="text-muted-foreground/80 text-balance break-keep">
                  {category.description ??
                    `${category.name} 카테고리에 속한 글들을 모아봤어요.`}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  WORK LOG · DEV NOTES
                </p>
                <p className="text-base font-medium text-foreground">
                  배우고, 만들고, 기록합니다.
                </p>
                <p className="text-muted-foreground/80 text-balance break-keep">
                  새로운 기술을 탐구하고 직접 구현해보는 과정, 문제 해결 경험,
                  프로젝트 회고, 그리고 나만의 개발 철학을 정리합니다. “오늘의
                  배움이 내일의 기반이 된다”는 마음으로, 꾸준히 생각을 쌓고
                  기록합니다.
                </p>
              </>
            )}
          </div>
        </section>
        <div>
          {/* 모바일 카테고리 필터 (작은 화면에서만 노출) */}
          <section className="mb-4 sm:hidden">
            <CategoryMobileFilter basePath="/" activeSlug={categorySlug} />
          </section>
          <PostCardGrid items={items} hrefBase="/post" hrefField="id" />
        </div>
      </div>
    </PageContainer.WithSidebar>
  );
};

export default PubliRootPage;
