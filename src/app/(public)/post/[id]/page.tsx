import { fetchPostByIdServer } from "@features/posts/server";
import { formatYmd } from "@shared/utils/date";
import BlockNoteViewerClient from "@ui/components/editor/BlockNoteViewer.client";
import PageContainer from "@ui/layouts/PageContainer";
import { Separator } from "@ui/shadcn/components";

type PublicPostDetailPageProps = {
  /**
   * @description URL 파라미터에서 전달된 게시글 ID입니다.
   */
  params: Promise<{
    id: string;
  }>;
};

/**
 * @description 공개용 게시글 상세 페이지입니다.
 * - 이미 발행된 게시글만 노출되며, 공개/비공개 라벨과 상단 툴바는 표시하지 않습니다.
 */
const PublicPostDetailPage = async ({ params }: PublicPostDetailPageProps) => {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id, 10);

  if (Number.isNaN(id)) {
    return (
      <PageContainer.Default>잘못된 게시글 ID 입니다.</PageContainer.Default>
    );
  }

  const post = await fetchPostByIdServer(id);

  // 발행되지 않았거나 존재하지 않는 게시글은 노출하지 않습니다.
  if (!post || !post.isPublished) {
    return (
      <PageContainer.Default>게시글을 찾을 수 없습니다.</PageContainer.Default>
    );
  }

  const createdYmd = formatYmd(post.createdAt ?? undefined);

  return (
    <PageContainer.Default>
      <article className="mx-auto mt-8 flex max-w-3xl flex-col gap-6">
        <header className="space-y-3 text-left">
          <h1 className="text-4xl font-semibold tracking-tight">
            {post.title}
          </h1>
          {/* 설명(옵션) */}
          {post.description && (
            <p className=" text-lg text-muted-foreground">{post.description}</p>
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
          <div className="text-xm text-end text-muted-foreground">
            <span>{createdYmd}</span>
          </div>
        </header>
        <Separator className="bg-foreground/30" />
        {/* 본문 */}
        <section className="page-content-viwer">
          <BlockNoteViewerClient
            contentJson={post.content ?? undefined}
            className="px-0"
          />
        </section>
      </article>
    </PageContainer.Default>
  );
};

export default PublicPostDetailPage;
