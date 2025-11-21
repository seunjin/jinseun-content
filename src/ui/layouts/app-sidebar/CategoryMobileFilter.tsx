import type { CategoryRow } from "@features/categories/schemas";
import { categoryRowSchema } from "@features/categories/schemas";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";
import { z } from "zod";

type CategoryWithCount = CategoryRow & {
  /** 해당 카테고리에 속한 공개된(isPublished=true) 게시글 개수 */
  visiblePostCount: number;
};

/**
 * @description 카테고리 목록을 API 라우트(`/api/categories/with-post-counts`)에서 조회합니다.
 * - 응답 스키마를 Zod로 검증해 타입 안전성을 보장합니다.
 * - 오류가 발생하면 null을 반환해 상위 컴포넌트에서 폴백 렌더링을 할 수 있게 합니다.
 */
const categoryWithCountSchema = categoryRowSchema.extend({
  visiblePostCount: z.number().int().min(0),
});

const fetchCategoriesFromApi = async (): Promise<
  CategoryWithCount[] | null
> => {
  try {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";
    const url = new URL(
      "/api/categories/with-post-counts?onlyVisible=true",
      appOrigin,
    ).toString();

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      data: unknown;
      requestId?: string;
      traceId?: string;
    };

    const parsed = categoryWithCountSchema.array().safeParse(json.data);
    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

export type CategoryMobileFilterProps = {
  /**
   * @description 카테고리 링크가 이동할 기본 경로입니다.
   * - 예: "/" 또는 "/admin/post"
   */
  basePath?: string;
  /**
   * @description 현재 활성화된 카테고리 슬러그입니다.
   * - 쿼리스트링의 category 값과 동일합니다.
   */
  activeSlug?: string;
};

/**
 * @description 모바일 화면에서 사용할 카테고리 필터 컴포넌트입니다.
 * - 전체/카테고리별 필터를 가로 스크롤 가능한 버튼 목록으로 표시합니다.
 */
const CategoryMobileFilter = async ({
  basePath = "/",
  activeSlug,
}: CategoryMobileFilterProps) => {
  const categories = await fetchCategoriesFromApi();

  const totalVisiblePostCount =
    categories?.reduce((sum, category) => sum + category.visiblePostCount, 0) ??
    0;

  const allActive = !activeSlug;

  if (!categories || categories.length === 0) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={basePath}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs",
            "text-muted-foreground bg-background",
          )}
        >
          전체
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 ">
      <Link
        href={basePath}
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium bg-background",
          allActive ? "text-primary border-primary" : "text-primary/35",
        )}
      >
        전체 ({totalVisiblePostCount})
      </Link>
      {categories.map((category) => {
        const isActive = activeSlug === category.slug;
        const href =
          category.slug && category.slug.length > 0
            ? `${basePath}?category=${encodeURIComponent(category.slug)}`
            : basePath;

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium bg-background",
              isActive ? "text-primary border-primary" : "text-primary/35",
            )}
          >
            {category.name} ({category.visiblePostCount})
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryMobileFilter;
