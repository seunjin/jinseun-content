"use client";

import type { PostSummary } from "@features/posts/types";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export type PostCardProps = {
  /** 카드에 렌더링할 게시글 요약 데이터 */
  item: PostSummary;
  /** 상세로 이동할 링크(선택). 제공 시 카드 전체를 링크로 렌더링합니다. */
  href?: string;
  /** 카드 외부 클래스 네이밍 확장 */
  className?: string;
  /** 비공개 여부를 시각적으로 표시할지 여부 */
  showStatus?: boolean;
};

/**
 * 게시글 카드 UI 컴포넌트(공용)
 * - 관리자/퍼블릭 공용 사용을 고려해 중립적인 표기와 구조로 구성합니다.
 */
const PostCard = ({ item, href, className, showStatus }: PostCardProps) => {
  // 썸네일이 없을 때 일관된(랜덤 아님) 그라디언트를 생성하기 위한 hue 해시
  const fallbackGradient = useMemo(() => {
    const base = item.slug || String(item.id);
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = (hash << 5) - hash + base.charCodeAt(i);
      hash |= 0; // 32bit
    }
    const hue = Math.abs(hash) % 360;
    const hue2 = (hue + 30) % 360;
    return `linear-gradient(135deg, hsl(${hue} 70% 45%) 0%, hsl(${hue2} 70% 55%) 100%)`;
  }, [item.id, item.slug]);

  const Thumbnail = (
    <div
      className="relative aspect-video w-full"
      style={{ perspective: "800px" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg border transition-transform group-hover:scale-102">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt="thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: fallbackGradient }}
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h3 className="text-[clamp(0.9rem,2.6vw,1.1rem)] leading-snug text-center font-semibold text-white line-clamp-2 text-balance">
                {item.title}
              </h3>
            </div>
          </>
        )}
        {showStatus && !item.isPublished && (
          <div className="absolute bottom-2 right-2">
            <span className="rounded-full border bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
              비공개
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const CardInner = (
    <article className={cn("grid grid-rows-[auto_1fr] rounded-lg", className)}>
      {/* 썸네일 */}
      {Thumbnail}

      {/* 본문 */}
      <div className="py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-2">
            {item.title}
          </h3>
        </div>
        {item.keywords && item.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent/40 transition-colors"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {CardInner}
      </Link>
    );
  }

  return <div className="group">{CardInner}</div>;
};

export default PostCard;

/** 스켈레톤 카드 */
export const PostCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse rounded-lg", className)}>
      <div className="aspect-video rounded-lg border bg-accent/30" />
      <div className="py-3">
        <div className="h-4 w-3/4 rounded bg-accent/50" />
        <div className="mt-3 flex gap-2 text-[11px]">
          <div className="h-3 w-12 rounded-full bg-accent/40" />
          <div className="h-3 w-10 rounded-full bg-accent/40" />
          <div className="h-3 w-8 rounded-full bg-accent/40" />
        </div>
      </div>
      <div className="h-2" />
    </div>
  );
};
