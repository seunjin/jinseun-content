"use client";

import type { PostSummary } from "@features/posts/types";
import Icon from "@ui/components/lucide-icons/Icon";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import Link from "next/link";

export type PostCardProps = {
  /** 카드에 렌더링할 게시글 요약 데이터 */
  item: PostSummary;
  /** 상세로 이동할 링크(선택). 제공 시 제목을 링크로 렌더링합니다. */
  href?: string;
  /** 상태 배지 표시 여부(기본: true) */
  showStatus?: boolean;
  /** 카테고리 배지 표시 여부(기본: true) */
  showCategory?: boolean;
  /** 카드 외부 클래스 네이밍 확장 */
  className?: string;
};

/**
 * 게시글 카드 UI 컴포넌트(공용)
 * - 관리자/퍼블릭 공용 사용을 고려해 중립적인 표기와 구조로 구성합니다.
 */
const PostCard = ({
  item,
  href,
  showStatus = true,
  showCategory = true,
  className,
}: PostCardProps) => {
  const created = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("ko-KR")
    : null;

  return (
    <Link href={href ?? ""}>
      <article
        className={cn(
          "group flex gap-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer",
          className,
        )}
      >
        {/* 썸네일 */}
        <div className="relative aspect-video w-1/5 overflow-hidden rounded-xl bg-accent">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt="thumbnail"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/70">
              <Icon name="ImageOff" className="size-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* 본문 */}
          <div className="flex flex-col gap-2  py-3">
            <div className="flex items-center gap-2">
              {showCategory && item.categoryName && (
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  {item.categoryName}
                </span>
              )}
              {showStatus && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    item.isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
                  )}
                >
                  {item.isPublished ? "published" : "draft"}
                </span>
              )}
            </div>

            <h3 className="line-clamp-2 text-base font-semibold text-foreground">
              {item.title}
            </h3>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between border-t py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="CalendarClock" size={14} />
              <span>{created ? `작성: ${created}` : "작성 정보 없음"}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;

/** 스켈레톤 카드 */
export const PostCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "animate-pulse flex gap-4 rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      {/* 썸네일 자리 */}
      <div className="relative aspect-video w-1/5 overflow-hidden rounded-xl bg-accent/50" />
      {/* 본문 자리 */}
      <div className="flex-1 py-3">
        <div className="mb-2 h-3 w-16 rounded bg-accent/60" />
        <div className="mb-3 h-4 w-3/4 rounded bg-accent/60" />
        <div className="h-8 border-t" />
      </div>
    </div>
  );
};
