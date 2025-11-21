import { fetchCategoryBySlugServer } from "@features/categories/server";
import type { PostRow } from "@features/posts/schemas";
import { fetchPostsServer } from "@features/posts/server";
import type { PostSummary } from "@features/posts/types";
import CategorySidebar from "@ui/layouts/app-sidebar/CategorySidebar";
import PageContainer from "@ui/layouts/PageContainer";
import AdminPostList from "./_components/AdminPostList.client";

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

type AdminPostPageProps = {
  /**
   * @description URL 쿼리 스트링으로 전달되는 검색 파라미터입니다.
   * - category: 카테고리 슬러그(예: "frontend", "til")
   */
  searchParams: Promise<{
    category?: string;
  }>;
};

const AdminPostPage = async ({ searchParams }: AdminPostPageProps) => {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;

  const category = categorySlug
    ? await fetchCategoryBySlugServer(categorySlug)
    : null;

  const posts = await fetchPostsServer({
    ...(category ? { categoryId: category.id } : {}),
  });

  const items = posts.map(mapPostRowToSummary);

  return (
    <PageContainer.WithSidebar
      sidebarComponent={
        <CategorySidebar basePath="/admin/post" activeSlug={categorySlug} />
      }
    >
      {/* --- 메인 컨텐츠 영역 --- */}
      <div className="flex flex-col gap-6">
        <AdminPostList items={items} />
      </div>
    </PageContainer.WithSidebar>
  );
};

export default AdminPostPage;
