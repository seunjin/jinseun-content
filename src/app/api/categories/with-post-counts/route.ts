import { createCategoriesApi } from "@features/categories/api";
import { categoryRowSchema } from "@features/categories/schemas";
import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * @description 카테고리별 공개된 게시글 개수를 포함한 목록을 조회합니다.
 * - data: CategoryRow & { visiblePostCount: number }[]
 * - 공개 글 is_published = true 인 게시글만 카운트에 포함합니다.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const supabase = await createServerSupabase();
    const searchParams = request.nextUrl.searchParams;
    const onlyVisible = searchParams.get("onlyVisible") === "true";

    const categoriesApi = createCategoriesApi(supabase);
    const categories = await categoriesApi.fetchCategories({ onlyVisible });

    if (categories.length === 0) {
      return NextResponse.json(createApiSuccess([], { requestId, traceId }), {
        status: 200,
      });
    }

    const categoryIds = categories.map((category) => category.id);

    // 공개된(is_published=true) 게시글 개수를 카테고리별로 집계합니다.
    const { data: postCountsRaw, error: postCountsError } = await supabase
      .from("posts")
      .select("category_id, is_published")
      .in("category_id", categoryIds)
      .eq("is_published", true);

    if (postCountsError) {
      throw postCountsError;
    }

    const countByCategoryId = new Map<number, number>();
    for (const row of postCountsRaw ?? []) {
      const categoryId = row.category_id as number | null;
      if (!categoryId) continue;
      const prev = countByCategoryId.get(categoryId) ?? 0;
      countByCategoryId.set(categoryId, prev + 1);
    }

    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      visiblePostCount: countByCategoryId.get(category.id) ?? 0,
    }));

    // Zod로 한 번 더 검증해 타입 안전성을 보장합니다.
    const categoryWithCountSchema = categoryRowSchema.extend({
      visiblePostCount: z.number().int().min(0),
    });
    const parsed = categoryWithCountSchema.array().parse(categoriesWithCounts);

    return NextResponse.json(createApiSuccess(parsed, { requestId, traceId }), {
      status: 200,
    });
  } catch (error) {
    const message =
      "카테고리별 공개 게시글 개수를 불러오는 중 오류가 발생했습니다.";
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, {
      status: 500,
    });
  }
}
