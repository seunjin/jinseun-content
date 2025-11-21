import type { PostRow } from "@features/posts/schemas";
import { fetchPostsServer } from "@features/posts/server";
import type { PostSummary } from "@features/posts/types";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import AppFooter from "@ui/layouts/AppFooter";
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

const PubliRootPage = async () => {
  const posts = await fetchPostsServer({ onlyPublished: true });
  const items = posts.map(mapPostRowToSummary);
  return (
    <PageContainer.WithSidebar sidebarComponent={<CategorySidebar />}>
      {/* --- 메인 컨텐츠 영역 --- */}
      <div className="flex flex-col gap-12">
        <PostCardGrid items={items} hrefBase="/post" hrefField="id" />
      </div>
    </PageContainer.WithSidebar>
  );
};

export default PubliRootPage;
