import { createCategoriesApi } from "@features/categories/api";
import { createCategoryInputSchema } from "@features/categories/schemas";
import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * @description 카테고리 목록을 조회합니다.
 * - `onlyVisible=true` 쿼리 파라미터가 있으면 노출 상태인 항목만 반환합니다.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const supabase = await createServerSupabase();
    const searchParams = request.nextUrl.searchParams;
    const onlyVisible = searchParams.get("onlyVisible") === "true";

    const categories = await createCategoriesApi(supabase).fetchCategories({
      onlyVisible,
    });

    return NextResponse.json(
      createApiSuccess(categories, { requestId, traceId }),
      { status: 200 },
    );
  } catch (error) {
    const message = "카테고리 목록을 불러오는 중 오류가 발생했습니다.";
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

/**
 * @description 신규 카테고리를 생성합니다.
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const rawBody = await request.json();
    const parsed = createCategoryInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      const response = createApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: "카테고리 입력 값이 올바르지 않습니다.",
        details: z.treeifyError(parsed.error),
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const categoriesApi = createCategoriesApi(supabase);
    const category = await categoriesApi.createCategory(parsed.data);

    return NextResponse.json(
      createApiSuccess(category, { requestId, traceId }),
      { status: 201 },
    );
  } catch (error) {
    const status =
      typeof (error as { code?: string }).code === "string" &&
      (error as { code: string }).code === "23505"
        ? 400
        : 500;

    const message =
      status === 400
        ? "이미 존재하는 슬러그입니다."
        : "카테고리를 생성하는 중 오류가 발생했습니다.";

    const response = createApiError({
      code:
        status === 400
          ? ApiErrorCode.BAD_REQUEST
          : ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status });
  }
}
