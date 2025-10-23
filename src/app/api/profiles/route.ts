import { createServerSupabase } from "@lib/supabase/server.supabase";
import { ApiErrorCode } from "@shared/lib/api/error-codes";
import { createApiError, createApiSuccess } from "@shared/lib/api/response";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createProfilesApi } from "../../../features/profiles/api";

/**
 * @description Supabase에서 프로필 목록을 조회해 반환합니다.
 * - 보호된 관리 도구에서 목록을 패칭할 때 사용합니다.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const traceId = request.headers.get("x-trace-id") ?? undefined;

  try {
    const supabase = await createServerSupabase();
    const profiles = await createProfilesApi(supabase).fetchProfiles();

    return NextResponse.json(
      createApiSuccess(profiles, { requestId, traceId }),
      { status: 200 },
    );
  } catch (error) {
    const message = "프로필 목록을 불러오는 중 오류가 발생했습니다.";
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
