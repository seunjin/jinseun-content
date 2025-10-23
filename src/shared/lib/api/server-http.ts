import { requireEnv } from "@shared/utils/env";
import { createApiClient } from "./api-client";
import { logApiError, logApiRequest, logApiResponse } from "./api-logger";
import { createHttpHelpers } from "./http-helpers";
import { extractResponseSnippet } from "./response-snippet";

/**
 * @description API 라우트는 애플리케이션과 동일한 오리진을 사용하므로 NEXT_PUBLIC_API_ORIGIN으로 통일합니다.
 * - 배포 환경에서 반드시 절대 URL(https://example.com) 형태로 지정해 주세요.
 */
const API_ORIGIN = requireEnv("NEXT_PUBLIC_API_ORIGIN");

const getMethod = (init?: RequestInit) =>
  init?.method ? init.method.toUpperCase() : "GET";

/**
 * @description 서버 컴포넌트·Route Handler에서 fetch 최적화를 살리기 위한 공용 클라이언트입니다.
 * - Next가 제공하는 revalidate/tags 등을 사용하기 위해 fetch(url, init) 패턴을 유지합니다.
 */
export const serverHttp = createApiClient(
  async (_request, { url, init }) => {
    const method = getMethod(init);
    const requestUrl = url.toString();
    const startedAt = Date.now();

    logApiRequest({
      method,
      url: requestUrl,
    });

    try {
      const response = await fetch(url, init);
      const duration = Date.now() - startedAt;

      logApiResponse({
        method,
        url: response.url || requestUrl,
        status: response.status,
        duration,
      });

      if (!response.ok) {
        const snippet = await extractResponseSnippet(response);
        logApiError({
          method,
          url: response.url || requestUrl,
          status: response.status,
          duration,
          bodySnippet: snippet,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startedAt;
      logApiError({
        method,
        url: requestUrl,
        duration,
        error,
      });
      throw error;
    }
  },
  {
    baseUrl: API_ORIGIN,
  },
);

/**
 * @description 서버 환경에서 동일한 HTTP 헬퍼를 제공합니다.
 */
export const serverApi = createHttpHelpers(serverHttp);
