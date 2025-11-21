import { fetchCategoriesServer } from "@features/categories/server";
import { fetchPostByIdServer } from "@features/posts/server";
import PageContainer from "@ui/layouts/PageContainer";
import EditPostForm from "./_components/EditPostForm.client";

type AdminEditPostPageProps = {
  /**
   * @description URL 파라미터에서 전달된 게시글 ID 프라미스입니다.
   * - Next.js Dynamic API 변경으로 params는 Promise 형태로 제공됩니다.
   */
  params: Promise<{
    id: string;
  }>;
};

/**
 * @description 관리자용 게시글 수정 페이지입니다.
 * - 서버에서 카테고리 목록과 대상 게시글을 조회해 클라이언트 컴포넌트에 전달합니다.
 */
const AdminEditPostPage = async ({ params }: AdminEditPostPageProps) => {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return (
      <PageContainer.Default>잘못된 게시글 ID 입니다.</PageContainer.Default>
    );
  }

  const [post, categories] = await Promise.all([
    fetchPostByIdServer(id),
    fetchCategoriesServer(),
  ]);

  if (!post) {
    return (
      <PageContainer.Default>게시글을 찾을 수 없습니다.</PageContainer.Default>
    );
  }

  return (
    <PageContainer.Default>
      <EditPostForm categories={categories} post={post} />
    </PageContainer.Default>
  );
};

export default AdminEditPostPage;
