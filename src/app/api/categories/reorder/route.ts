import { createCategoriesApi } from "@features/categories/api";
import { reorderCategoriesInputSchema } from "@features/categories/schemas";
import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * @description 카테고리 정렬 순서를 일괄 업데이트합니다.
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const rawBody = await request.json();
    const parsed = reorderCategoriesInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      const response = createApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: "정렬 입력 값이 올바르지 않습니다.",
        details: z.treeifyError(parsed.error),
        requestId,
        traceId,
      });
      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const categoriesApi = createCategoriesApi(supabase);
    const updated = await categoriesApi.reorderCategories(parsed.data);

    return NextResponse.json(
      createApiSuccess(updated, { requestId, traceId }),
      { status: 200 },
    );
  } catch (error) {
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: "정렬 순서를 변경하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 500 });
  }
}
