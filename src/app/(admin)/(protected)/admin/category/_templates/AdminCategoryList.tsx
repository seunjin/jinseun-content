"use client";

import type { CategoryRow } from "@features/categories/schemas";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import { Spinner } from "@ui/shadcn/components/spinner";
import { useCategoriesQuery } from "../_hooks/useCategoriesQuery";

export interface AdminCategoryListProps {
  initialCategories: CategoryRow[];
}

const AdminCategoryList = ({ initialCategories }: AdminCategoryListProps) => {
  const { categories, error, isRefetching, refetch } =
    useCategoriesQuery(initialCategories);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 border rounded-lg p-6 text-center">
        <div className="text-destructive">{error}</div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          size="sm"
        >
          {isRefetching ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <Icon name="RefreshCcw" className="mr-2 size-4" />
          )}
          다시 시도
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        아직 생성된 카테고리가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          size="sm"
        >
          {isRefetching ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <Icon name="RefreshCcw" className="mr-2 size-4" />
          )}
          새로고침
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => (
          <div
            key={item.id}
            className="group border rounded-xl bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-lg focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/30 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3 border-b px-4 py-3 transition-colors group-hover:bg-primary/5">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  slug: {item.slug}
                </span>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.isVisible
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {item.isVisible ? "visible" : "hidden"}
              </span>
            </div>
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {item.description?.trim() ? (
                item.description
              ) : (
                <span className="italic text-muted-foreground/70">
                  소개 문구가 없습니다.
                </span>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
              <Icon name="CalendarClock" size={14} />
              <span>
                수정:{" "}
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString("ko-KR")
                  : "알 수 없음"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoryList;
