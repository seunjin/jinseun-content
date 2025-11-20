import type { CategoryRow } from "@features/categories/schemas";
import { categoryRowSchema } from "@features/categories/schemas";
import { cn } from "@ui/shadcn/lib/utils";

/**
 * @description 카테고리 목록을 API 라우트(`/api/categories`)에서 조회합니다.
 * - 응답 스키마를 Zod로 검증해 타입 안전성을 보장합니다.
 * - 오류가 발생하면 null을 반환해 상위 컴포넌트에서 폴백 렌더링을 할 수 있게 합니다.
 */
const fetchCategoriesFromApi = async (): Promise<CategoryRow[] | null> => {
  try {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";
    const url = new URL(
      "/api/categories?onlyVisible=true",
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

    const parsed = categoryRowSchema.array().safeParse(json.data);
    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const CategorySidebar = async () => {
  const categories = await fetchCategoriesFromApi();

  // 전체 카테고리는 "공개된 글" 전체 개수를 나타냅니다. (현재는 더미 값 0)
  const totalVisiblePostCount = 0;

  // API 오류 또는 빈 결과인 경우, "전체"만 노출합니다.
  if (!categories || categories.length === 0) {
    return (
      <div className="overflow-auto h-full overscroll-contain">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            className={cn(
              "flex w-full justify-start px-3 py-2",
              "text-primary/35 rounded-lg",
              "transition-[padding-left,color,background-color] duration-300",
              "cursor-pointer",
              "hover:text-primary hover:pl-5 hover:bg-border/30 dark:hover:bg-primary/20",
            )}
          >
            전체 ({totalVisiblePostCount})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full overscroll-contain">
      {/* 기본 전체 항목 */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          className={cn(
            "flex w-full justify-start px-3 py-2",
            "text-primary/35 rounded-lg",
            "transition-[padding-left,color,background-color] duration-300",
            "cursor-pointer",
            "hover:text-primary hover:pl-5 hover:bg-border/30 dark:hover:bg-primary/20",
          )}
        >
          전체 ({totalVisiblePostCount})
        </button>
      </div>

      {/* 각 카테고리 이름 옆 괄호에는 해당 카테고리에 속한 "공개된 글" 개수를 표시합니다. (현재는 더미 값 0) */}
      {categories.map((category) => (
        <div key={category.id} className="flex items-center gap-2 mb-2">
          <button
            type="button"
            className={cn(
              "flex w-full justify-start px-3 py-2",
              "text-primary/35  rounded-lg ",
              "transition-[padding-left,color,background-color] duration-300",
              "cursor-pointer",
              "hover:text-primary hover:pl-5 hover:bg-border/30 dark:hover:bg-primary/20",
            )}
          >
            {category.name} (0)
          </button>
        </div>
      ))}
    </div>
  );
};

export default CategorySidebar;
