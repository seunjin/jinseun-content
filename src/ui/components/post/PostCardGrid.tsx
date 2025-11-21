"use client";

import type { PostSummary } from "@features/posts/types";
import { cn } from "@ui/shadcn/lib/utils";
import PostCard, { PostCardSkeleton } from "./PostCard";

// Post 카드 그리드 공통 클래스: 2열 레이아웃
const GRID_CLASS = "grid gap-6 grid-cols-1 lg:grid-cols-2" as const;

export type PostCardGridProps = {
  /** 렌더링할 게시글 목록 */
  items: PostSummary[];
  /** 상세 링크 베이스 경로(선택). 예: "/admin/post" 또는 "/blog" */
  hrefBase?: string;
  /** 링크에 사용할 식별자 필드(기본: "id"). */
  hrefField?: "id" | "slug";
  /** 그리드 외부 클래스 확장 */
  className?: string;
  /** 로딩 여부(스켈레톤 표시) */
  loading?: boolean;
  /** 비공개 여부를 카드에서 표시할지 여부 */
  showStatus?: boolean;
};

/**
 * 게시글 카드 그리드(공용)
 * - 반응형 그리드로 카드를 배치합니다.
 */
const PostCardGrid = ({
  items,
  hrefBase,
  hrefField = "id",
  className,
  loading,
  showStatus,
}: PostCardGridProps) => {
  if (loading) {
    const skeletonKeys = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
    return (
      <div className={cn(GRID_CLASS, className)}>
        {skeletonKeys.map((k) => (
          <PostCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        아직 작성된 글이 없습니다.
      </div>
    );
  }

  return (
    <div className={cn(GRID_CLASS, className)}>
      {items.map((item) => {
        const link = hrefBase
          ? `${hrefBase}/${hrefField === "slug" ? item.slug : item.id}`
          : undefined;
        return (
          <PostCard
            key={item.id}
            item={item}
            href={link}
            showStatus={showStatus}
          />
        );
      })}
    </div>
  );
};

export default PostCardGrid;
