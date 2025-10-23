# HTTP 클라이언트 재설계 메모

## 목표
- Supabase SDK를 데이터 소스로 사용하되, API Route/서버 액션/클라이언트에서 동일한 HTTP 클라이언트 패턴을 사용합니다.
- HTTP 통신은 `ky`를 래핑해 사용하고, 클라이언트 상태 관리는 React Query v5를 기준으로 합니다.
- `clientHttp.get`·`post`·`put`·`patch`·`delete` 형태로 메서드를 분리합니다.
- 제네릭은 `<{ request: Request; response: Response; meta: Meta }>` 형태로 주고, 생략 가능한 타입은 `never`를 기본값으로 둡니다.
- `schema` 옵션을 사용해 응답 검증을 붙일 수 있도록 하되, 필수는 아닙니다.
- 로깅, 오류 처리 등 공통 동작은 기존 유틸(`logApiRequest`)을 재사용합니다.

## 타입 개요
```ts
type HttpResult<Response, Meta> = {
  data: Response;
  meta: Meta;
};

type RequestOptions<Request, Response, Meta> = {
  body?: Request; // POST/PUT/PATCH 등에서 사용하며, T["request"] 타입을 따릅니다.
  query?: Record<string, string | number | boolean | undefined>;
  headers?: HeadersInit;
  /**
   * @description (선택) 외부 API 등 검증이 필요한 경우에만 Zod 스키마를 전달합니다.
   * - 내부 Supabase 기반 API는 이미 서버에서 Zod 검증을 완료했으므로 대부분 생략 가능합니다.
   */
  schema?: ZodSchema<HttpResult<Response, Meta>>;
  signal?: AbortSignal;
  // 필요 시 retry/hook 등 확장용 슬롯
};

type HttpClient = {
  get<T extends { request?: never; response: unknown; meta?: unknown }>(
    url: string,
    options?: Omit<RequestOptions<T["request"], T["response"], T["meta"]>, "body">,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  post<T extends { request: unknown; response: unknown; meta?: unknown }>(
    url: string,
    options: RequestOptions<T["request"], T["response"], T["meta"]>,
  ): Promise<HttpResult<T["response"], T["meta"]>>;
  // put/patch/delete 동일 패턴
};
```

## 사용 예시
```ts
type CreateProfileRequest = { email: string; name: string; role?: string };
type CreateProfileResponse = ProfileRow;
type CreateProfileMeta = { invitedBy: string };

const result = await clientHttp.post<
  {
    request: CreateProfileRequest;
    response: CreateProfileResponse;
    meta: CreateProfileMeta;
  }
>("/api/admin/profiles", {
  body: payload,
});

console.log(result.data); // ProfileRow
console.log(result.meta); // { invitedBy: string }
```

## 구현 방향
1. `clientHttp` 내부에서 `fetch` 호출 공통 처리 (query string, base URL, 헤더 합치기)
2. `schema`가 있으면 `schema.parse`로 검증 후 반환. 없으면 `HttpResult` 구조에 맞춰 변환
3. 메서드별로 `body` 허용 여부/필수 여부를 타입으로 강제
4. 필요 시 `createServerHttp` 등 동일 시그니처로 확장 가능
5. HTTP 오류 발생 시 `ApiClientError`로 래핑해 `ApiErrorCode`·`requestId`·`traceId`를 그대로 전달

## API 응답 규약 제안
- 공통 응답 형태는 `{ data: T; meta: M }` 구조를 기본으로 합니다.
- 에러 응답은 `{ error: { code: string; message: string; details?: unknown } }` 형태로 통일합니다.
- 이 규약을 타입으로 명시하기 위해 `src/shared/lib/api/types.ts` 파일을 두고 아래와 같은 타입을 정의합니다.
  ```ts
  export type ApiSuccess<TData, TMeta = never> = {
    data: TData;
    meta?: TMeta extends never ? undefined : TMeta;
    /**
     * @description 서버에서 발급한 요청 식별자입니다.
     * - 로그 상호 연관을 위해 응답마다 포함합니다.
     */
    requestId?: string;
    /**
     * @description 분산 추적을 위해 사용되는 트레이스 식별자입니다.
     * - OpenTelemetry 등 APM 연동 시 바로 활용 가능합니다.
     */
    traceId?: string;
  };

  export type ApiError = {
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
    requestId?: string;
    traceId?: string;
  };
  ```
- 서버·클라이언트에서 동일한 규약을 참조해 응답을 구성하고, `ky` 기반 클라이언트에서도 해당 타입을 반환하도록 설계합니다.
- 응답 생성 시 `src/shared/lib/api/response.ts`의 `createApiSuccess`·`createApiError`를 사용해 `requestId`·`traceId`를 자동으로 주입합니다.
- 에러 코드는 `src/shared/lib/api/error-codes.ts`에서 상수로 관리해 서버와 클라이언트의 분기 로직을 일원화합니다.
