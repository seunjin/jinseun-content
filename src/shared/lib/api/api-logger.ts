/**
 * @description API 요청/응답/에러를 통합해 기록하는 유틸리티입니다.
 * - 콘솔 로그는 개발 편의상 유지하고, 차후 Sentry 등 APM을 연결하기 쉽게 설계합니다.
 */

export type ApiLogContext = {
  /** 호출된 API의 절대 URL */
  url: string;
  /** HTTP 메서드 (대문자) */
  method: string;
  /** 응답 HTTP 상태 코드 */
  status?: number;
  /** 요청→응답까지 걸린 시간(ms) */
  duration?: number;
  /** 에러 객체 */
  error?: unknown;
  /** 응답 본문의 요약 문자열 */
  bodySnippet?: string;
};

/**
 * @description 요청 직전에 호출해 메서드·URL 정보를 남깁니다.
 */
export const logApiRequest = (ctx: ApiLogContext) => {
  console.info("[api/request]", ctx.method, ctx.url);
};

/**
 * @description 정상/에러 여부와 상관없이 응답 완료 시 호출합니다.
 */
export const logApiResponse = (ctx: ApiLogContext) => {
  console.info(
    "[api/response]",
    ctx.method,
    ctx.url,
    ctx.status,
    `${ctx.duration ?? 0}ms`,
  );
};

/**
 * @description 에러 발생 시 추가 정보를 기록합니다.
 * - 추후 Sentry를 붙일 때 이 지점에서 Breadcrumb/Scope 등을 확장합니다.
 */
export const logApiError = (ctx: ApiLogContext) => {
  console.error(
    "[api/error]",
    ctx.method,
    ctx.url,
    ctx.status,
    ctx.bodySnippet,
    ctx.error,
  );
};
