import type { ZodSchema } from "zod";

/**
 * @description API 성공 응답의 공통 형태입니다.
 * - 메타 정보가 필요 없을 경우 제네릭에 `never`를 전달하면 `meta`는 `undefined`로 처리됩니다.
 */
export type ApiSuccess<TData, TMeta = never> = {
  data: TData;
  /**
   * @description 추가 메타 정보가 있을 때만 포함합니다.
   * - `never`를 전달하면 타입상 `undefined`로 제한됩니다.
   */
  meta?: TMeta extends never ? undefined : TMeta;
  /** 추적을 위해 서버가 발급하는 요청 ID */
  requestId?: string;
  /** 분산 추적을 위한 trace ID */
  traceId?: string;
};

/**
 * @description API 오류 응답의 공통 형태입니다.
 * - 서버·클라이언트에서 일관된 에러 구조를 사용하기 위한 기본 타입입니다.
 */
export type ApiError = {
  /** 트레이싱 연동을 위한 요청 ID */
  requestId?: string;
  /** APM 연계에 활용할 trace ID */
  traceId?: string;
  error: {
    /** 서비스 고유의 에러 코드 */
    code: string;
    /** 사용자 또는 개발자가 이해하기 쉬운 에러 메시지 */
    message: string;
    /** 추가 디버깅 정보 */
    details?: unknown;
  };
};

/**
 * @description HTTP 클라이언트가 반환하는 기본 데이터 구조입니다.
 * - API 성공 응답 타입과 동일한 구조를 재사용합니다.
 */
export type HttpResult<TResponse, TMeta = never> = ApiSuccess<TResponse, TMeta>;

/**
 * @description HTTP 요청을 구성할 때 사용하는 옵션입니다.
 * - 제네릭으로 요청/응답/메타 타입을 지정해 타입 안정성을 보장합니다.
 */
export type HttpRequestOptions<TRequest, TResponse, TMeta = never> = {
  /** JSON 본문으로 전송할 페이로드 */
  body?: TRequest;
  /** 쿼리스트링으로 전송할 키-값 쌍 */
  query?: Record<string, string | number | boolean | undefined>;
  /** 추가 헤더 */
  headers?: HeadersInit;
  /**
   * @description 응답 스키마 검증이 필요할 때만 전달합니다.
   * - 외부 API 연동처럼 불확실성이 큰 경우에 사용하고, 내부 API는 선택적으로 사용합니다.
   */
  schema?: ZodSchema<HttpResult<TResponse, TMeta>>;
  /** AbortController로 전달받은 AbortSignal */
  signal?: AbortSignal;
};

/**
 * @description 내부적으로 사용하는 HTTP 메서드 문자열입니다.
 */
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/**
 * @description HTTP 클라이언트가 제공해야 하는 메서드 시그니처 모음입니다.
 */
export type HttpClient = {
  get<T extends { request?: never; response: unknown; meta?: unknown }>(
    url: string,
    options?: Omit<
      HttpRequestOptions<T["request"], T["response"], T["meta"]>,
      "body"
    >,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  post<T extends { request: unknown; response: unknown; meta?: unknown }>(
    url: string,
    options: HttpRequestOptions<T["request"], T["response"], T["meta"]>,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  put<T extends { request: unknown; response: unknown; meta?: unknown }>(
    url: string,
    options: HttpRequestOptions<T["request"], T["response"], T["meta"]>,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  patch<T extends { request: unknown; response: unknown; meta?: unknown }>(
    url: string,
    options: HttpRequestOptions<T["request"], T["response"], T["meta"]>,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  delete<T extends { request?: never; response: unknown; meta?: unknown }>(
    url: string,
    options?: Omit<
      HttpRequestOptions<T["request"], T["response"], T["meta"]>,
      "body"
    >,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
};
