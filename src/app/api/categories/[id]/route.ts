import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import { createCategoriesApi } from "@features/categories/api";
import {
  categoryRowSchema,
  updateCategoryInputSchema,
} from "@features/categories/schemas";

const paramsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "카테고리 ID는 숫자여야 합니다.")
    .transform((value) => Number.parseInt(value, 10)),
});

/**
 * @description ID 기준으로 카테고리를 조회합니다.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<unknown> },
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    const response = createApiError({
      code: ApiErrorCode.BAD_REQUEST,
      message: "카테고리 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const categoriesApi = createCategoriesApi(supabase);

    const category = await categoriesApi.fetchCategoryById(
      parsedParams.data.id,
    );

    if (!category) {
      const response = createApiError({
        code: ApiErrorCode.NOT_FOUND,
        message: "카테고리를 찾을 수 없습니다.",
        requestId,
        traceId,
      });
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json(
      createApiSuccess(categoryRowSchema.parse(category), {
        requestId,
        traceId,
      }),
      { status: 200 },
    );
  } catch (error) {
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: "카테고리를 조회하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * @description ID 기준으로 카테고리를 수정합니다.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<unknown> },
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    const response = createApiError({
      code: ApiErrorCode.BAD_REQUEST,
      message: "카테고리 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const rawBody = await request.json();
    const parsedBody = updateCategoryInputSchema.safeParse({
      id: parsedParams.data.id,
      ...rawBody,
    });

    if (!parsedBody.success) {
      const response = createApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: "카테고리 입력 값이 올바르지 않습니다.",
        details: z.treeifyError(parsedBody.error),
        requestId,
        traceId,
      });
      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const categoriesApi = createCategoriesApi(supabase);

    const category = await categoriesApi.updateCategory(parsedBody.data);

    return NextResponse.json(
      createApiSuccess(categoryRowSchema.parse(category), {
        requestId,
        traceId,
      }),
      { status: 200 },
    );
  } catch (error) {
    const status =
      typeof (error as { code?: string }).code === "string" &&
      (error as { code: string }).code === "23505"
        ? 400
        : 500;

    const response = createApiError({
      code:
        status === 400
          ? ApiErrorCode.BAD_REQUEST
          : ApiErrorCode.INTERNAL_SERVER_ERROR,
      message:
        status === 400
          ? "이미 존재하는 슬러그입니다."
          : "카테고리를 수정하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status });
  }
}

/**
 * @description ID 기준으로 카테고리를 삭제합니다.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<unknown> },
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    const response = createApiError({
      code: ApiErrorCode.BAD_REQUEST,
      message: "카테고리 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const categoriesApi = createCategoriesApi(supabase);

    const existing = await categoriesApi.fetchCategoryById(
      parsedParams.data.id,
    );

    if (!existing) {
      const response = createApiError({
        code: ApiErrorCode.NOT_FOUND,
        message: "카테고리를 찾을 수 없습니다.",
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 404 });
    }

    await categoriesApi.deleteCategory(parsedParams.data.id);

    return NextResponse.json(
      createApiSuccess({ deleted: true }, { requestId, traceId }),
      { status: 200 },
    );
  } catch (error) {
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: "카테고리를 삭제하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 500 });
  }
}
