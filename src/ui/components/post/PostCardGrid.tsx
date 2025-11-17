"use client";

import type { PostSummary } from "@features/posts/types";
import { cn } from "@ui/shadcn/lib/utils";
import PostCard, { PostCardSkeleton } from "./PostCard";

export type PostCardGridProps = {
  /** 렌더링할 게시글 목록 */
  items: PostSummary[];
  /** 각 카드의 상세 링크 생성기(선택) */
  toHref?: (item: PostSummary) => string;
  /** 그리드 외부 클래스 확장 */
  className?: string;
  /** 로딩 여부(스켈레톤 표시) */
  loading?: boolean;
};

/**
 * 게시글 카드 그리드(공용)
 * - 반응형 그리드로 카드를 배치합니다.
 */
const PostCardGrid = ({
  items,
  toHref,
  className,
  loading,
}: PostCardGridProps) => {
  if (loading) {
    const skeletonKeys = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
      >
        {skeletonKeys.map((k) => (
          <PostCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        아직 작성된 글이 없습니다.
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item) => (
        <PostCard key={item.id} item={item} href={toHref?.(item)} />
      ))}
    </div>
  );
};

export default PostCardGrid;
