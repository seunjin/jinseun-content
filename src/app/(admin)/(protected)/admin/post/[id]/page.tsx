import { fetchPostByIdServer } from "@features/posts/server";
import BlockNoteViewer from "@ui/components/editor/BlockNoteViewer";
import Icon from "@ui/components/lucide-icons/Icon";
import PageContainer from "@ui/layouts/PageContainer";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";
import Link from "next/link";

type AdminPostDetailPageProps = {
  /**
   * @description URL 파라미터에서 전달된 게시글 ID 프라미스입니다.
   * - Next.js Dynamic API 변경으로 params는 Promise 형태로 제공됩니다.
   */
  params: Promise<{
    id: string;
  }>;
};

/**
 * @description 관리자용 게시글 상세 페이지입니다.
 * - 서버에서 직접 Supabase를 호출해 단일 게시글 정보를 조회합니다.
 */
const AdminPostDetailPage = async ({ params }: AdminPostDetailPageProps) => {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  // 잘못된 ID 형식인 경우 간단한 오류 메시지를 노출합니다.
  if (Number.isNaN(id)) {
    return (
      <PageContainer.Default>잘못된 게시글 ID 입니다.</PageContainer.Default>
    );
  }

  const post = await fetchPostByIdServer(id);

  if (!post) {
    return (
      <PageContainer.Default>게시글을 찾을 수 없습니다.</PageContainer.Default>
    );
  }

  return (
    <PageContainer.Default>
      <PageTopToolbar>
        <div className="flex gap-2">
          <Link href="/admin/post">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/post/${post.id}/edit`}>
            <Button variant="default" size="sm">
              <Icon name="PenSquare" />
              편집하기
            </Button>
          </Link>
        </div>
      </PageTopToolbar>

      {/* 게시글 기본 메타 정보 영역 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {post.id} · 슬러그: {post.slug} ·{" "}
          {post.isPublished ? "공개" : "비공개"}
        </p>
        {post.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {post.description}
          </p>
        )}
      </div>

      {/* BlockNote 기반 본문(content) 뷰어 */}
      <div className="mt-6">
        <BlockNoteViewer contentJson={post.content ?? undefined} />
      </div>
    </PageContainer.Default>
  );
};

export default AdminPostDetailPage;
