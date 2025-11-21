import { fetchPostByIdServer } from "@features/posts/server";
import { formatYmd } from "@shared/utils/date";
import BlockNoteToc from "@ui/components/editor/BlockNoteToc";
import BlockNoteViewerClient from "@ui/components/editor/BlockNoteViewer.client";
import Icon from "@ui/components/lucide-icons/Icon";
import PageContainer from "@ui/layouts/PageContainer";
import { Button, Separator } from "@ui/shadcn/components";
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

  const createdYmd = formatYmd(post.createdAt ?? undefined);

  return (
    <PageContainer.WithSidebar
      className="--sidebar-width: 15rem"
      sidebarPostion="right"
      sidebarComponent={<BlockNoteToc />}
    >
      <article className="mx-auto flex flex-col gap-6">
        {/* toolbar */}
        <div className="flex justify-between  gap-2">
          <Link href="/admin/post">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
          <Link href={`/admin/post/${post.id}/edit`}>
            <Button variant="default" size="sm">
              <Icon name="PenSquare" />
              수정하기
            </Button>
          </Link>
        </div>
        {/* 타이틀 */}

        <header className="space-y-3 text-left">
          <h1 className="text-4xl font-semibold tracking-tight">
            {post.title}
          </h1>
          {/* 설명(옵션) */}
          {post.description && (
            <p className="text-lg text-muted-foreground">{post.description}</p>
          )}

          {/* 키워드 */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-2 text-xs text-muted-foreground">
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
          <div className="flex items-center justify-end gap-3 text-xm text-muted-foreground">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                post.isPublished
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {post.isPublished ? "published" : "draft"}
            </span>

            {createdYmd && (
              <>
                <span className="text-border">|</span>
                <span>{createdYmd}</span>
              </>
            )}
          </div>
        </header>

        <Separator className="bg-foreground/10" />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* BlockNote 기반 본문(content) 뷰어 */}
          <section className="page-content-viwer flex-1">
            <BlockNoteViewerClient
              contentJson={post.content ?? undefined}
              className="px-0"
            />
          </section>
        </div>
      </article>
    </PageContainer.WithSidebar>
  );
};

export default AdminPostDetailPage;
