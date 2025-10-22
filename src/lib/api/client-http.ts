import ky, { HTTPError } from "ky";
import { createApiClient } from "./api-client";
import { logApiError, logApiRequest, logApiResponse } from "./api-logger";
import { extractResponseSnippet } from "./response-snippet";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;
const requestTimings = new WeakMap<Request, number>();

/**
 * @description 브라우저 환경에서 사용할 인증 헤더 주입 자리입니다.
 * - 현재는 토큰이 없으므로 형태만 유지하며, 실제 토큰 로직은 후속 작업에서 교체합니다.
 */
const applyClientAuth = (request: Request) => {
  // 여기에 Authorization 헤더를 설정하거나 기타 공통 헤더를 주입합니다.
  return request;
};

const getMethod = (request: Request) =>
  request.method ? request.method.toUpperCase() : "GET";

/**
 * @description 브라우저에서 공통으로 사용할 ky 인스턴스입니다.
 * - 토큰 주입, 로깅 등 팀 규칙을 훅에 모아두기 위함입니다.
 * - throwHttpErrors를 비활성화해 HTTP 상태 코드별 처리를 ApiError로 위임합니다.
 */
export const clientKy = ky.create({
  // API 라우트는 동일 오리진을 사용하므로 NEXT_PUBLIC_API_ORIGIN을 그대로 prefix로 둡니다.
  prefixUrl: API_ORIGIN,
  retry: {
    limit: 0,
  },
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      (request) => {
        applyClientAuth(request);
        requestTimings.set(request, Date.now());
        logApiRequest({
          method: getMethod(request),
          url: request.url,
        });
        return request;
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        const method = getMethod(request);
        const startedAt = requestTimings.get(request) ?? Date.now();
        const duration = Date.now() - startedAt;

        logApiResponse({
          method,
          url: response.url ?? request.url,
          status: response.status,
          duration,
        });

        if (!response.ok) {
          const snippet = await extractResponseSnippet(response);
          logApiError({
            method,
            url: response.url ?? request.url,
            status: response.status,
            duration,
            bodySnippet: snippet,
          });
        }
        requestTimings.delete(request);
        return response;
      },
    ],
  },
});

/**
 * @description 브라우저 전용 API 클라이언트. createApiClient에 ky 실행기를 주입해
 * 문서의 단일 인터페이스를 구현합니다.
 */
export const clientHttp = createApiClient(
  async (request, _context) => {
    try {
      // ky는 Request 객체를 그대로 받을 수 있으므로 추가 가공 없이 전달합니다.
      return await clientKy(request);
    } catch (error) {
      const startedAt = requestTimings.get(request) ?? Date.now();
      const duration = Date.now() - startedAt;
      requestTimings.delete(request);
      logApiError({
        method: getMethod(request),
        url: request.url,
        duration,
        error,
      });
      if (error instanceof HTTPError) {
        // HTTPError 역시 Response를 노출하므로 ApiClient에서 일관 처리되도록 그대로 반환합니다.
        return error.response;
      }
      throw error;
    }
  },
  {
    baseUrl: API_ORIGIN,
  },
);
