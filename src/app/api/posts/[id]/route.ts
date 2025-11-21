import { createPostsApi } from "@features/posts/api";
import { postRowSchema, updatePostInputSchema } from "@features/posts/schemas";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import { createServerSupabase } from "@shared/lib/supabase/server.supabase";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "게시글 ID는 숫자여야 합니다.")
    .transform((value) => Number.parseInt(value, 10)),
});

/**
 * @description ID 기준으로 단일 게시글을 조회합니다.
 * - 존재하지 않는 ID인 경우 404를 반환합니다.
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
      message: "게시글 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const postsApi = createPostsApi(supabase);

    const post = await postsApi.fetchPostById(parsedParams.data.id);

    if (!post) {
      const response = createApiError({
        code: ApiErrorCode.NOT_FOUND,
        message: "게시글을 찾을 수 없습니다.",
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json(
      createApiSuccess(postRowSchema.parse(post), {
        requestId,
        traceId,
      }),
      { status: 200 },
    );
  } catch (error) {
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: "게시글을 조회하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * @description ID 기준으로 게시글을 수정합니다.
 * - 본문, 메타데이터, 발행 여부 등을 모두 포함한 전체 업데이트를 수행합니다.
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
      message: "게시글 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const rawBody = await request.json();
    const parsedBody = updatePostInputSchema.safeParse({
      id: parsedParams.data.id,
      ...rawBody,
    });

    if (!parsedBody.success) {
      const response = createApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: "게시글 입력 값이 올바르지 않습니다.",
        details: z.treeifyError(parsedBody.error),
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const postsApi = createPostsApi(supabase);

    const post = await postsApi.updatePost(parsedBody.data);

    return NextResponse.json(
      createApiSuccess(postRowSchema.parse(post), {
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
          : "게시글을 수정하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status });
  }
}

/**
 * @description ID 기준으로 게시글을 삭제합니다.
 * - 존재하지 않는 ID인 경우 404를 반환합니다.
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
      message: "게시글 ID가 유효하지 않습니다.",
      details: z.treeifyError(parsedParams.error),
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const postsApi = createPostsApi(supabase);

    // 먼저 게시글이 존재하는지 확인합니다.
    const existing = await postsApi.fetchPostById(parsedParams.data.id);
    if (!existing) {
      const response = createApiError({
        code: ApiErrorCode.NOT_FOUND,
        message: "게시글을 찾을 수 없습니다.",
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 404 });
    }

    await postsApi.deletePost(parsedParams.data.id);

    return NextResponse.json(
      createApiSuccess({ id: parsedParams.data.id }, { requestId, traceId }),
      { status: 200 },
    );
  } catch (error) {
    const response = createApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: "게시글을 삭제하는 중 오류가 발생했습니다.",
      details: error,
      requestId,
      traceId,
    });

    return NextResponse.json(response, { status: 500 });
  }
}
