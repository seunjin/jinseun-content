import ky, { HTTPError, type KyInstance, type Options } from "ky";
import { ZodError } from "zod";
import { logApiError, logApiRequest, logApiResponse } from "./api-logger";
import type { ApiErrorCode } from "./error-codes";
import type {
  ApiError,
  HttpClient,
  HttpMethod,
  HttpRequestOptions,
  HttpResult,
} from "./types";

const DEFAULT_PREFIX_URL = process.env.NEXT_PUBLIC_API_ORIGIN;

const defaultKyConfig: Options = {};
if (DEFAULT_PREFIX_URL) {
  defaultKyConfig.prefixUrl = DEFAULT_PREFIX_URL;
}

type KyInstanceWithDefaults = KyInstance & {
  defaults?: {
    prefixUrl?: string | URL;
  };
};

const defaultKyInstance = ky.create(defaultKyConfig) as KyInstanceWithDefaults;

/**
 * @description HTTP 클라이언트에서 사용하는 API 오류 객체입니다.
 * - 서버가 반환한 `ApiError` 구조를 그대로 담아 전달합니다.
 */
export class ApiClientError<TDetails = unknown> extends Error {
  /** HTTP 상태 코드 */
  readonly status?: number;
  /** 표준화된 API 오류 코드 */
  readonly code: ApiErrorCode;
  /** 서버가 전달한 추가 상세 정보 */
  readonly details?: TDetails;
  /** 서버가 발급한 요청 ID */
  readonly requestId?: string;
  /** 트레이싱용 trace ID */
  readonly traceId?: string;

  constructor(params: {
    message: string;
    status?: number;
    code: ApiErrorCode;
    details?: TDetails;
    requestId?: string;
    traceId?: string;
    cause?: unknown;
  }) {
    super(params.message, { cause: params.cause });
    this.name = "ApiClientError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.requestId = params.requestId;
    this.traceId = params.traceId;
  }
}

export type CreateHttpClientOptions = {
  /** ky 인스턴스를 커스터마이징하고 싶을 때 전달합니다. */
  kyInstance?: KyInstanceWithDefaults;
  /** 로깅용으로 사용할 prefixUrl을 강제로 지정할 때 사용합니다. */
  prefixUrlOverride?: string;
};

/**
 * @description 상대 경로와 prefixUrl을 조합해 절대 URL을 계산합니다.
 */
const resolveAbsoluteUrl = (prefixUrl: string | undefined, url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!prefixUrl) {
    return url;
  }

  try {
    return new URL(url, prefixUrl).toString();
  } catch {
    return url;
  }
};

/**
 * @description 쿼리 객체에서 undefined 값을 제거하고 문자열로 변환합니다.
 */
const buildSearchParams = (
  query?: Record<string, string | number | boolean | undefined>,
) => {
  if (!query) {
    return undefined;
  }

  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined,
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    entries.map(([key, value]) => [key, String(value)]),
  );
};

/**
 * @description 본문 또는 에러 내용을 로그에 남기기 위해 잘라냅니다.
 */
const snippet = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length <= 200) {
    return trimmed;
  }

  return `${trimmed.slice(0, 200)}...`;
};

/**
 * @description API 응답을 HttpResult 형태로 정규화합니다.
 */
const normalizeResult = <TResponse, TMeta>(
  payload: HttpResult<TResponse, TMeta>,
): HttpResult<TResponse, TMeta> => {
  const normalized: HttpResult<TResponse, TMeta> = {
    data: payload.data,
  };

  if (Object.hasOwn(payload, "meta")) {
    normalized.meta = payload.meta;
  }

  if (payload.requestId) {
    normalized.requestId = payload.requestId;
  }

  if (payload.traceId) {
    normalized.traceId = payload.traceId;
  }

  return normalized;
};

/**
 * @description 응답 JSON이 ApiError 형태인지 검사합니다.
 */
const isApiErrorPayload = (value: unknown): value is ApiError => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (
    !("error" in record) ||
    !record.error ||
    typeof record.error !== "object"
  ) {
    return false;
  }

  const errorRecord = record.error as Record<string, unknown>;
  if (
    typeof errorRecord.code !== "string" ||
    typeof errorRecord.message !== "string"
  ) {
    return false;
  }

  return true;
};

/**
 * @description ky 인스턴스에서 prefixUrl을 추출합니다.
 */
const extractPrefixUrl = (
  instance: KyInstanceWithDefaults,
): string | undefined => {
  const prefixUrl = instance.defaults?.prefixUrl;
  if (!prefixUrl) {
    return undefined;
  }

  if (typeof prefixUrl === "string") {
    return prefixUrl;
  }

  return prefixUrl.toString();
};

/**
 * @description HTTP 요청을 공통 처리하는 내부 함수입니다.
 */
const createRequester =
  (kyInstance: KyInstanceWithDefaults, loggingPrefixUrl: string | undefined) =>
  async <TRequest, TResponse, TMeta = never>(
    method: HttpMethod,
    url: string,
    options?: HttpRequestOptions<TRequest, TResponse, TMeta>,
  ): Promise<HttpResult<TResponse, TMeta>> => {
    const upperMethod = method.toUpperCase();
    const absoluteUrl = resolveAbsoluteUrl(loggingPrefixUrl, url);
    const startedAt = Date.now();

    logApiRequest({
      method: upperMethod,
      url: absoluteUrl,
    });

    const { body, headers, query, schema, signal } = options ?? {};

    let response: Response | undefined;
    let responseClone: Response | undefined;
    let parsedErrorPayload: ApiError | undefined;

    try {
      response = await kyInstance(url, {
        method: upperMethod,
        headers,
        searchParams: buildSearchParams(query),
        json: body,
        signal,
      });
      responseClone = response.clone();

      const rawResult = (await response.json()) as HttpResult<TResponse, TMeta>;
      const normalized = normalizeResult(rawResult);

      const data = schema ? schema.parse(normalized) : normalized;

      const duration = Date.now() - startedAt;
      logApiResponse({
        method: upperMethod,
        url: response.url ?? absoluteUrl,
        status: response.status,
        duration,
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startedAt;
      let status: number | undefined;
      let targetUrl = absoluteUrl;
      let bodySnippet: string | undefined;

      if (error instanceof HTTPError) {
        status = error.response.status;
        targetUrl = error.response.url;
        try {
          const clonedResponse = error.response.clone();
          const text = await clonedResponse.text();
          bodySnippet = snippet(text);
          if (text) {
            try {
              const json = JSON.parse(text);
              if (isApiErrorPayload(json)) {
                parsedErrorPayload = json;
              }
            } catch {
              parsedErrorPayload = undefined;
            }
          }
        } catch {
          bodySnippet = undefined;
        }
      } else if (response) {
        status = response.status;
        targetUrl = response.url ?? absoluteUrl;
      }

      if (!bodySnippet && responseClone) {
        try {
          const text = await responseClone.text();
          bodySnippet = snippet(text);
        } catch {
          bodySnippet = undefined;
        }
      }

      if (!bodySnippet && error instanceof ZodError) {
        bodySnippet = snippet(JSON.stringify(error.issues));
      }

      logApiError({
        method: upperMethod,
        url: targetUrl,
        status,
        duration,
        error,
        bodySnippet,
      });

      logApiResponse({
        method: upperMethod,
        url: targetUrl,
        status,
        duration,
      });

      if (parsedErrorPayload) {
        throw new ApiClientError({
          message: parsedErrorPayload.error.message,
          status,
          code: parsedErrorPayload.error.code as ApiErrorCode,
          details: parsedErrorPayload.error.details,
          requestId: parsedErrorPayload.requestId,
          traceId: parsedErrorPayload.traceId,
          cause: error,
        });
      }

      throw error;
    }
  };

/**
 * @description 프로젝트 전역에서 사용할 HTTP 클라이언트를 생성합니다.
 */
export const createHttpClient = (
  options: CreateHttpClientOptions = {},
): HttpClient => {
  const kyInstance = options.kyInstance ?? defaultKyInstance;
  const loggingPrefixUrl =
    options.prefixUrlOverride ??
    extractPrefixUrl(kyInstance) ??
    DEFAULT_PREFIX_URL;

  const request = createRequester(kyInstance, loggingPrefixUrl);

  return {
    get: async <
      T extends { request?: never; response: unknown; meta?: unknown },
    >(
      requestUrl: string,
      requestOptions?: Omit<
        HttpRequestOptions<T["request"], T["response"], T["meta"]>,
        "body"
      >,
    ) =>
      request<T["request"], T["response"], T["meta"]>(
        "get",
        requestUrl,
        requestOptions as HttpRequestOptions<
          T["request"],
          T["response"],
          T["meta"]
        >,
      ),
    post: async <
      T extends { request: unknown; response: unknown; meta?: unknown },
    >(
      requestUrl: string,
      requestOptions: HttpRequestOptions<
        T["request"],
        T["response"],
        T["meta"]
      >,
    ) =>
      request<T["request"], T["response"], T["meta"]>(
        "post",
        requestUrl,
        requestOptions,
      ),
    put: async <
      T extends { request: unknown; response: unknown; meta?: unknown },
    >(
      requestUrl: string,
      requestOptions: HttpRequestOptions<
        T["request"],
        T["response"],
        T["meta"]
      >,
    ) =>
      request<T["request"], T["response"], T["meta"]>(
        "put",
        requestUrl,
        requestOptions,
      ),
    patch: async <
      T extends { request: unknown; response: unknown; meta?: unknown },
    >(
      requestUrl: string,
      requestOptions: HttpRequestOptions<
        T["request"],
        T["response"],
        T["meta"]
      >,
    ) =>
      request<T["request"], T["response"], T["meta"]>(
        "patch",
        requestUrl,
        requestOptions,
      ),
    delete: async <
      T extends { request?: never; response: unknown; meta?: unknown },
    >(
      requestUrl: string,
      requestOptions?: Omit<
        HttpRequestOptions<T["request"], T["response"], T["meta"]>,
        "body"
      >,
    ) =>
      request<T["request"], T["response"], T["meta"]>(
        "delete",
        requestUrl,
        requestOptions as HttpRequestOptions<
          T["request"],
          T["response"],
          T["meta"]
        >,
      ),
  };
};

/**
 * @description 즉시 사용할 수 있는 기본 HTTP 클라이언트 인스턴스입니다.
 */
export const clientHttp = createHttpClient();
