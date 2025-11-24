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
 * @description 카테고리 목록을 API 라우트(`/api/categories`)에서 조회합니다.
 * - 응답 스키마를 Zod로 검증해 타입 안전성을 보장합니다.
 * - 오류가 발생하면 null을 반환해 상위 컴포넌트에서 폴백 렌더링을 할 수 있게 합니다.
 */
const categoryWithCountSchema = categoryRowSchema.extend({
  visiblePostCount: z.number().int().min(0),
});

/**
 * @description 카테고리 목록 + 공개 글 개수를 API 라우트에서 조회합니다.
 */
const fetchCategoriesFromApi = async (): Promise<
  CategoryWithCount[] | null
> => {
  try {
    const appOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const url = new URL(
      "/api/categories/with-post-counts?onlyVisible=true",
      appOrigin,
    ).toString();

    const response = await fetch(url, {
      // 카테고리 변경이 UI에 바로 반영되도록 캐시를 사용하지 않습니다.
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

type CategorySidebarProps = {
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

const CategorySidebar = async ({
  basePath = "/",
  activeSlug,
}: CategorySidebarProps) => {
  const categories = await fetchCategoriesFromApi();

  const totalVisiblePostCount =
    categories?.reduce((sum, category) => sum + category.visiblePostCount, 0) ??
    0;

  const allActive = !activeSlug;

  // API 오류 또는 빈 결과인 경우, "전체"만 노출합니다.
  if (!categories || categories.length === 0) {
    return (
      <div className="mb-2 flex items-center gap-5">
        <Link
          href={basePath}
          className={cn(
            "flex w-full justify-start",
            "text-primary/35",
            "transition-[padding-left,color,background-color] duration-300",
            "cursor-pointer",
            "hover:text-primary hover:pl-2",
          )}
        >
          전체 ({totalVisiblePostCount})
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 기본 전체 항목 */}
      <div className="flex items-center gap-5">
        <Link
          href={basePath}
          className={cn(
            "flex w-full justify-start",
            allActive ? " text-primary font-semibold" : "text-primary/35",
            "transition-[padding-left,color,background-color] duration-300",
            "cursor-pointer",
            "hover:text-primary hover:pl-2 ",
          )}
        >
          전체 ({totalVisiblePostCount})
        </Link>
      </div>

      {/* 각 카테고리 이름 옆 괄호에는 해당 카테고리에 속한 "공개된 글" 개수를 표시합니다. */}
      {categories.map((category) => {
        const isActive = activeSlug === category.slug;
        const href =
          category.slug && category.slug.length > 0
            ? `${basePath}?category=${encodeURIComponent(category.slug)}`
            : basePath;

        return (
          <div key={category.id} className="flex items-center gap-2">
            <Link
              href={href}
              className={cn(
                "flex w-full justify-start ",
                isActive ? "text-primary font-semibold" : "text-primary/35",
                "transition-[padding-left,color,background-color] duration-300",
                "cursor-pointer",
                "hover:text-primary hover:pl-2 ",
              )}
            >
              {category.name} ({category.visiblePostCount})
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySidebar;
