import type { PostSummary } from "@features/posts/types";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import CategorySidebar from "@ui/layouts/app-sidebar/CategorySidebar";
import PageContainer from "@ui/layouts/PageContainer";

const AdminPostPage = () => {
  // TODO: 실제 API 연동 전까지 임시 목업 데이터
  const _items: PostSummary[] = [
    {
      id: 1,
      slug: "hello-world",
      title: "Hello World",
      categoryName: "일반",
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: null,
    },
    {
      id: 2,
      slug: "my-second-post",
      title: "두 번째 글",
      categoryName: "React",
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <PageContainer.WithSidebar sidebarComponent={<CategorySidebar />}>
      {/* --- 메인 컨텐츠 영역 --- */}
      {/* 토픽 콘텐츠 */}
      <div className="flex flex-col gap-12">
        {/* 핫 토픽 */}
        {/* <PageTopToolbar
        leftSideComponents={<span className="font-semibold">글 목록</span>}
        rightSideComponents={
          <Link href="/admin/post/create">
            <Button size="sm">
              <Icon name="FilePlus" /> 새 글 작성
            </Button>
          </Link>
        }
        /> */}
        {/* NEW 토픽 */}
        <PostCardGrid
          items={_items}
          hrefBase="/admin/post"
          hrefField="id"
          className="mt-4"
        />
      </div>
    </PageContainer.WithSidebar>
  );
};

export default AdminPostPage;
