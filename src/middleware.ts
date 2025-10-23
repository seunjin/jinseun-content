import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const generateId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const ensureId = (value: string | null) =>
  value && value.length > 0 ? value : generateId();

/**
 * @description 모든 요청에 requestId/traceId 헤더를 강제 주입합니다.
 */
export function middleware(request: NextRequest) {
  const ensuredRequestId = ensureId(request.headers.get("x-request-id"));
  const ensuredTraceId = ensureId(request.headers.get("x-trace-id"));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", ensuredRequestId);
  requestHeaders.set("x-trace-id", ensuredTraceId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", ensuredRequestId);
  response.headers.set("x-trace-id", ensuredTraceId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
