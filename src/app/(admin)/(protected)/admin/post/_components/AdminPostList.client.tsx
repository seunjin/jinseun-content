"use client";

import type { PostSummary } from "@features/posts/types";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import { Button } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { useMemo, useState } from "react";

type AdminPostListProps = {
  /** 서버에서 전달된 게시글 요약 목록 (공개 + 비공개 포함) */
  items: PostSummary[];
};

type PostFilter = "all" | "published" | "draft";

const AdminPostList = ({ items }: AdminPostListProps) => {
  const [filter, setFilter] = useState<PostFilter>("all");

  const { totalCount, publishedCount, draftCount, filteredItems } =
    useMemo(() => {
      const total = items.length;
      const published = items.filter((item) => item.isPublished).length;
      const draft = total - published;

      let filtered = items;
      if (filter === "published") {
        filtered = items.filter((item) => item.isPublished);
      } else if (filter === "draft") {
        filtered = items.filter((item) => !item.isPublished);
      }

      return {
        totalCount: total,
        publishedCount: published,
        draftCount: draft,
        filteredItems: filtered,
      };
    }, [items, filter]);

  return (
    <div className="flex flex-col gap-4">
      {/* 필터 바: 전체 / 공개 / 비공개 + 카운트 */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "inline-flex rounded-full border bg-muted/40 p-1",
            "text-xs",
          )}
        >
          <Button
            type="button"
            size="sm"
            variant={filter === "all" ? "default" : "ghost"}
            className="rounded-full px-3"
            onClick={() => setFilter("all")}
          >
            전체 ({totalCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "published" ? "default" : "ghost"}
            className="rounded-full px-3"
            onClick={() => setFilter("published")}
          >
            공개 ({publishedCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "draft" ? "default" : "ghost"}
            className="rounded-full px-3"
            onClick={() => setFilter("draft")}
          >
            비공개 ({draftCount})
          </Button>
        </div>
      </div>

      <PostCardGrid
        items={filteredItems}
        hrefBase="/admin/post"
        hrefField="id"
        showStatus
      />
    </div>
  );
};

export default AdminPostList;
