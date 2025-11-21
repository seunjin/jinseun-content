import { createPostsApi } from "@features/posts/api";
import { createPostInputSchema } from "@features/posts/schemas";
import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * @description 게시글 목록을 조회합니다.
 * - 현재는 발행된 글(isPublished=true)만 반환합니다.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const supabase = await createServerSupabase();
    const postsApi = createPostsApi(supabase);
    const posts = await postsApi.fetchPosts({ onlyPublished: true });

    return NextResponse.json(createApiSuccess(posts, { requestId, traceId }), {
      status: 200,
    });
  } catch (error) {
    const message = "게시글 목록을 불러오는 중 오류가 발생했습니다.";
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
 * @description 신규 게시글을 생성합니다.
 * - isPublished 플래그에 따라 비공개(초안) 또는 공개(발행) 상태로 저장됩니다.
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const rawBody = await request.json();
    const parsed = createPostInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      const response = createApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: "게시글 입력 값이 올바르지 않습니다.",
        details: z.treeifyError(parsed.error),
        requestId,
        traceId,
      });

      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // 디버그: 실제 JWT 안 email 확인
    const { data: userData } = await supabase.auth.getUser();
    console.log("POST /api/posts user email:", userData.user?.email);

    const postsApi = createPostsApi(supabase);
    const post = await postsApi.createPost(parsed.data);

    return NextResponse.json(createApiSuccess(post, { requestId, traceId }), {
      status: 201,
    });
  } catch (error) {
    const status =
      typeof (error as { code?: string }).code === "string" &&
      (error as { code: string }).code === "23505"
        ? 400
        : 500;

    const message =
      status === 400
        ? "이미 존재하는 슬러그입니다."
        : "게시글을 생성하는 중 오류가 발생했습니다.";

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
