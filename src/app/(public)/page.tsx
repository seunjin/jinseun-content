import { fetchCategoryBySlugServer } from "@features/categories/server";
import type { PostRow } from "@features/posts/schemas";
import { fetchPostsWithCountServer } from "@features/posts/server";
import type { PostSummary } from "@features/posts/types";
import Pagination from "@ui/components/Pagination";
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
   * - page: 페이지 번호(1부터 시작). 없으면 1페이지로 처리합니다.
   */
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
};

const PubliRootPage = async ({ searchParams }: PublicRootPageProps) => {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;
  const pageParam = resolvedSearchParams.page;
  /**
   * @description 유효하지 않은 page 값이 들어와도 최소 1페이지로 보정합니다.
   */
  const page = Number.isNaN(Number(pageParam))
    ? 1
    : Math.max(1, Number.parseInt(pageParam ?? "1", 10));
  /**
   * @description 한 페이지에 보여줄 게시글 개수입니다.
   */
  const PAGE_SIZE = 12;

  const category = categorySlug
    ? await fetchCategoryBySlugServer(categorySlug)
    : null;

  let posts: PostRow[] = [];
  let totalCount = 0;
  try {
    const result = await fetchPostsWithCountServer({
      onlyPublished: true,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      ...(category ? { categoryId: category.id } : {}),
    });
    posts = result.items;
    totalCount = result.totalCount;
  } catch {
    // 데이터 조회에 실패한 경우에는 총 개수를 0으로 간주하고
    // 아래에서 "존재하지 않는 페이지" 메시지를 노출합니다.
    posts = [];
    totalCount = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  /**
   * @description 존재하지 않는 페이지 번호를 입력한 경우 마지막 페이지를 기준으로 보정합니다.
   * - URL 자체는 그대로 두고, 화면에 보여줄 페이지 번호와 데이터만 보정/표시합니다.
   */
  const isPageOutOfRange = page > totalPages;
  const currentPage = Math.min(page, totalPages);
  const items = isPageOutOfRange ? [] : posts.map(mapPostRowToSummary);

  const buildPageHref = (targetPage: number) => {
    /**
     * @description 카테고리 필터가 유지되도록 category 쿼리와 함께 page 쿼리를 구성합니다.
     */
    const params = new URLSearchParams();
    if (categorySlug) {
      params.set("category", categorySlug);
    }
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

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
          {isPageOutOfRange ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              요청하신 페이지는 존재하지 않습니다. 페이지 번호를 다시 확인해
              주세요.
            </div>
          ) : (
            <PostCardGrid items={items} hrefBase="/post" hrefField="id" />
          )}
          <Pagination
            className="mt-20"
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={buildPageHref}
          />
        </div>
      </div>
    </PageContainer.WithSidebar>
  );
};

export default PubliRootPage;
