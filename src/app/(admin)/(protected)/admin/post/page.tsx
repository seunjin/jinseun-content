import type { PostSummary } from "@features/posts/types";
import Icon from "@ui/components/lucide-icons/Icon";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import AppSideBar from "@ui/layouts/AppSidebar";
import Main from "@ui/layouts/Main";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";

const AdminPostPage = () => {
  // TODO: 실제 API 연동 전까지 임시 목업 데이터
  const items: PostSummary[] = [
    {
      id: 1,
      slug: "hello-world",
      title: "Hello World",
      categoryName: "일반",
      isPublished: true,
      updatedAt: new Date().toISOString(),
      thumbnailUrl: null,
    },
    {
      id: 2,
      slug: "my-second-post",
      title: "두 번째 글",
      categoryName: "React",
      isPublished: false,
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <Main>
      <PageTopToolbar
        leftSideComponents={<span className="font-semibold">글 목록</span>}
        rightSideComponents={
          <Link href="/admin/post/create">
            <Button size="sm">
              <Icon name="FilePlus" /> 새 글 작성
            </Button>
          </Link>
        }
      />
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:gap-6"
        )}
      >
        <AppSideBar />
        <PostCardGrid
          items={items}
          hrefBase="/admin/post"
          hrefField="id"
          className="mt-4"
        />
      </div>
    </Main>
  );
};

export default AdminPostPage;
