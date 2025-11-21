import { fetchCategoriesServer } from "@features/categories/server";
import PageContainer from "@ui/layouts/PageContainer";
import CreatePostForm from "./_components/CreatePostForm.client";

const AdminCreatePostPage = async () => {
  // 서버에서 카테고리 목록을 조회해 정렬 순서대로 옵션을 구성합니다.
  const categories = await fetchCategoriesServer();
  return (
    <PageContainer.Default>
      <CreatePostForm categories={categories} />
    </PageContainer.Default>
  );
};

export default AdminCreatePostPage;
