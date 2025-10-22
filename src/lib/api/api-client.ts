import type { z } from "zod";

/**
 * API 호출 실패 시 던질 공통 오류 객체
 * @description HTTP 상태 코드와 응답 전문의 일부(snippet)를 보존해 디버깅에 활용한다.
 */
export class ApiError extends Error {
  /** HTTP 상태 코드 */
  public readonly status: number;
  /** 응답 전문 중 앞부분 요약 */
  public readonly snippet: string;
  /** 원본 에러 */
  public readonly cause?: unknown;
  /** 응답 본문 전체(가능한 경우) */
  public readonly body?: unknown;

  public constructor(
    status: number,
    message: string,
    options: { snippet: string; cause?: unknown; body?: unknown },
  ) {
    super(`HTTP ${status} ${message} :: ${options.snippet}`);
    this.name = "ApiError";
    this.status = status;
    this.snippet = options.snippet;
    this.cause = options.cause;
    this.body = options.body;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

type QueryInput = Record<string, QueryValue> | URLSearchParams;

type ParseAs = "json" | "text" | "arrayBuffer" | "blob";

type JsonBody = {
  json: unknown;
  formData?: never;
  urlEncoded?: never;
  binary?: never;
};
type FormDataBody = {
  json?: never;
  formData: FormData;
  urlEncoded?: never;
  binary?: never;
};
type UrlEncodedSource = URLSearchParams | Record<string, QueryValue>;
type UrlEncodedBody = {
  json?: never;
  formData?: never;
  urlEncoded: UrlEncodedSource;
  binary?: never;
};
type PrimitiveBody = string | FormData | URLSearchParams;
type BinarySource = Exclude<BodyInit, PrimitiveBody>;
type BinaryBody = {
  json?: never;
  formData?: never;
  urlEncoded?: never;
  binary: BinarySource;
};
type EmptyBody = {
  json?: never;
  formData?: never;
  urlEncoded?: never;
  binary?: never;
};

type BodyOption =
  | JsonBody
  | FormDataBody
  | UrlEncodedBody
  | BinaryBody
  | EmptyBody;

type BaseRequestOptions<TSchema extends z.ZodTypeAny | undefined> = {
  url: string;
  method?: HttpMethod;
  headers?: HeadersInit;
  query?: QueryInput;
  parseAs?: ParseAs;
  schema?: TSchema;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  next?: RequestInit["next"];
  signal?: AbortSignal;
};

export type ApiRequestOptions<
  TSchema extends z.ZodTypeAny | undefined = undefined,
> = BaseRequestOptions<TSchema> & BodyOption;

type InferSchema<TSchema> = TSchema extends z.ZodTypeAny
  ? z.infer<TSchema>
  : unknown;

export type ApiClient = <TSchema extends z.ZodTypeAny | undefined>(
  options: ApiRequestOptions<TSchema>,
) => Promise<InferSchema<TSchema>>;

type ExecutorContext = {
  /** 실행 엔진에서 필요 시 fetch(url, init) 형태로 다시 호출할 수 있도록 전달 */
  init: RequestInit;
  url: URL;
};

type Executor = (
  request: Request,
  context: ExecutorContext,
) => Promise<Response>;

type ApiClientDefaults = {
  baseUrl?: string;
  headers?: HeadersInit;
};

/**
 * API 클라이언트를 생성하는 팩토리
 * @description 서버(fetch)와 클라(ky)의 공통 인터페이스를 가진 함수를 만들어 낸다.
 */
export const createApiClient = (
  executor: Executor,
  defaults: ApiClientDefaults = {},
): ApiClient => {
  /** 요청 URL을 조합하는 내부 함수 */
  const resolveUrl = (rawUrl: string): URL => {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return new URL(rawUrl);
    }

    const base =
      defaults.baseUrl ??
      (typeof window !== "undefined" ? window.location.origin : undefined);
    if (!base) {
      throw new Error("상대 경로를 사용할 때는 baseUrl을 지정해야 합니다.");
    }
    return new URL(rawUrl, base);
  };

  return async <TSchema extends z.ZodTypeAny | undefined>(
    options: ApiRequestOptions<TSchema>,
  ): Promise<InferSchema<TSchema>> => {
    const url = resolveUrl(options.url);
    applyQuery(url.searchParams, options.query);

    const headers = new Headers(defaults.headers);
    mergeHeaders(headers, options.headers);

    const init: RequestInit = {
      method: options.method ?? "GET",
      headers,
      cache: options.cache,
      credentials: options.credentials,
      mode: options.mode,
      redirect: options.redirect,
      next: options.next,
      signal: options.signal,
    };

    applyBody(init, headers, options);

    // ky·fetch가 동일하게 사용할 수 있도록 Request 객체를 미리 구성한다.
    const request = new Request(url.toString(), init);
    let response: Response;

    try {
      response = await executor(request, { url, init });
    } catch (error) {
      throw new ApiError(500, "Network Error", {
        snippet:
          (error instanceof Error && error.message) ||
          "알 수 없는 네트워크 오류입니다.",
        cause: error,
      });
    }

    const rawBody = await parseBody(response, options.parseAs);
    if (!response.ok) {
      const snippet = createSnippet(rawBody);
      throw new ApiError(
        response.status,
        response.statusText || "Unknown Error",
        {
          snippet,
          body: rawBody,
        },
      );
    }

    if (!options.schema) {
      return rawBody as InferSchema<TSchema>;
    }

    const parsed = options.schema.safeParse(rawBody);
    if (parsed.success) {
      return parsed.data as InferSchema<TSchema>;
    }

    throw new ApiError(response.status, "Schema Validation Error", {
      snippet: parsed.error.message,
      cause: parsed.error,
      body: rawBody,
    });
  };
};

/** 객체·URLSearchParams 기반 쿼리 파라미터를 URL에 병합한다. */
const applyQuery = (target: URLSearchParams, query?: QueryInput) => {
  if (!query) return;

  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      target.set(key, value);
    });
    return;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    target.set(key, String(value));
  });
};

/** 공통 헤더 기본값과 호출부 헤더를 병합한다. */
const mergeHeaders = (target: Headers, headers?: HeadersInit) => {
  if (!headers) return;
  new Headers(headers).forEach((value, key) => {
    target.set(key, value);
  });
};

/** JSON/FormData/URL-Encoded/Binary 중 단일 옵션만 허용하도록 바디를 설정한다. */
const applyBody = (
  init: RequestInit,
  headers: Headers,
  options: BodyOption,
) => {
  if ("json" in options && options.json !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    init.body = JSON.stringify(options.json);
    return;
  }

  if ("formData" in options && options.formData) {
    init.body = options.formData;
    headers.delete("Content-Type");
    return;
  }

  if ("urlEncoded" in options && options.urlEncoded) {
    const search =
      options.urlEncoded instanceof URLSearchParams
        ? options.urlEncoded
        : createUrlSearchParams(options.urlEncoded);
    if (!headers.has("Content-Type")) {
      headers.set(
        "Content-Type",
        "application/x-www-form-urlencoded;charset=UTF-8",
      );
    }
    init.body = search;
    return;
  }

  if ("binary" in options && options.binary) {
    init.body = toBodyBinary(options.binary);
  }
};

/** 레코드 형태의 파라미터를 URLSearchParams로 변환한다. */
const createUrlSearchParams = (record: Record<string, QueryValue>) => {
  const search = new URLSearchParams();
  Object.entries(record).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.set(key, String(value));
  });
  return search;
};

/** 바이너리 입력을 fetch가 이해할 수 있는 BodyInit으로 변환한다. */
const toBodyBinary = (binary: BinaryBody["binary"]) => {
  if (binary instanceof ArrayBuffer) {
    return binary;
  }
  if (ArrayBuffer.isView(binary)) {
    return binary;
  }
  if (
    typeof ReadableStream !== "undefined" &&
    binary instanceof ReadableStream
  ) {
    return binary;
  }
  return binary;
};

/** Content-Type을 기반으로 적절한 파싱 전략을 도출한다. */
const detectParseAs = (response: Response): ParseAs => {
  const contentType = response.headers.get("Content-Type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("text/")) return "text";
  if (contentType.includes("application/octet-stream")) return "arrayBuffer";
  if (contentType.includes("application/pdf")) return "arrayBuffer";
  if (contentType.includes("image/") || contentType.includes("video/"))
    return "blob";
  return "json";
};

/** 실제 응답 본문을 파싱해 호출부에 전달한다. */
const parseBody = async (response: Response, parseAs?: ParseAs) => {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const mode = parseAs ?? detectParseAs(response);
  switch (mode) {
    case "text": {
      return response.text();
    }
    case "arrayBuffer": {
      return response.arrayBuffer();
    }
    case "blob": {
      return response.blob();
    }
    default: {
      if (response.headers.get("Content-Length") === "0") {
        return null;
      }
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  }
};

/** 에러 응답을 요약해 사람이 읽기 쉬운 스니펫으로 가공한다. */
const createSnippet = (body: unknown) => {
  if (body === null || body === undefined) return "응답 본문이 없습니다.";
  if (typeof body === "string") {
    return body.replace(/\s+/g, " ").slice(0, 160);
  }
  if (ArrayBuffer.isView(body)) {
    return `Binary(${body.byteLength})`;
  }
  if (body instanceof ArrayBuffer) {
    return `Binary(${body.byteLength})`;
  }
  try {
    return JSON.stringify(body).slice(0, 160);
  } catch {
    return "본문을 직렬화할 수 없습니다.";
  }
};
