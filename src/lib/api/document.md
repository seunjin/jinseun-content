미니 문서 (Codex CLI에게 전달할 설명)

목적
- 서버는 native fetch(Next 15 최적화 기능 유지), 클라이언트는 ky를 사용해 DX를 끌어올린다.
- 호출자는 항상 `apiClient(url, options)`만 부르면 되고, 바디 타입 네 가지(JSON/FormData/URL-Encoded/Binary)는 상호 배타(XOR)로 강제한다.
- 응답은 `Content-Type`에 따라 자동 파싱되며, 필요하면 `parseAs`로 강제 타입을 지정한다.
- Zod 스키마를 전달하면 런타임 검증을 실행해 API 안정성을 확보한다.

사용 예시
```ts
// 서버 컴포넌트 또는 Route Handler
import { serverHttp } from "@/lib/api/server-http";
import { postSchema } from "@/schemas/post";

const post = await serverHttp({
  url: "/posts",
  method: "POST",
  json: { title: "새 글", body: "본문" },
  schema: postSchema,
});

// 클라이언트 (React Query)
import { useQuery } from "@tanstack/react-query";
import { clientHttp } from "@/lib/api/client-http";

export const usePost = (id: string) =>
  useQuery({
    queryKey: ["post", id],
    queryFn: () => clientHttp({ url: `/posts/${id}` }),
  });
```

설계 포인트
1. 단일 인터페이스, 이중 엔진
   - 서버: `fetch(fullUrl, { next: { revalidate, tags } })`를 그대로 활용해 ISR, 태그 무효화, 요청 캐시를 살린다.
   - 클라이언트: 준비된 ky 인스턴스를 사용해 HTTP 에러 자동 throw, timeout, retry, hook 기반 확장을 제공한다.
2. 바디 타입 XOR
   - `json`, `formData`, `urlEncoded`, `binary`는 동시에 사용할 수 없게 타입으로 강제한다.
   - FormData 사용 시 `Content-Type`을 직접 지정하지 않아 boundary를 보존한다.
   - URLSearchParams는 런타임이 헤더를 자동 지정하도록 두고, 필요 시 `contentType` 옵션으로 오버라이드한다.
3. 쿼리 문자열 통합
   - `query` 옵션으로 객체 또는 `URLSearchParams`를 받으며, 서버/클라 모두 동일 로직으로 URL을 조합한다.
4. 응답 파싱 규칙
   - 기본은 `Content-Type`에 따라 JSON/Text/ArrayBuffer 중 하나로 자동 파싱한다.
   - `parseAs` 옵션을 제공해 호출부에서 강제로 파싱 전략을 지정할 수 있다.
   - 에러는 `HTTP ${status} ${statusText} :: snippet` 형태 메시지로 정규화한다.
5. 확장 포인트
   - 클라이언트 ky 인스턴스의 `beforeRequest`/`afterResponse` 훅에서 토큰 주입, 재시도, 로깅, 에러 매핑을 처리한다.
   - 서버에서는 `next` 옵션을 통해 캐시/태그 전략을 호출부에서 직접 제어한다.

환경 변수
- 서버/클라이언트 공통: `process.env.NEXT_PUBLIC_API_ORIGIN` (절대 URL, 예: `https://jinseun.dev`).
- 로컬 개발은 `http://localhost:3000`, 프리뷰/프로덕션은 각 도메인으로 설정한다.
- 기본값은 `.env.local`에 정의하고, 배포 플랫폼 환경 변수에도 동일 키로 주입한다.
- 환경별(base/staging/prod) URL 스위치는 `next.config.ts` 혹은 헬퍼 모듈에서 `process.env` 값을 읽어 처리한다.

에러 처리 규칙
- 공통 예외 객체: `throw new ApiError(status, statusText, { snippet, body, cause })`.
- 서버와 클라이언트 모두 `{ code, message, details }` 패턴 응답을 ApiError 내부 필드로 매핑한다.
- React Query의 `retry`, 전역 로깅, 사용자 피드백 레이어는 ApiError 타입을 기준으로 분기한다.

구현 체크리스트
- [ ] `src/lib/api/create-http-client.ts`에서 요청 옵션(XOR), 헤더 자동화, `parseAs` 로직을 정의한다.
- [ ] `serverHttp`와 `clientHttp` 바인딩 파일을 만들고 각 환경 전용 fetch 엔진(fetch/ky)을 주입한다.
- [ ] ky 인스턴스에 `beforeRequest`/`afterResponse` 훅을 등록해 토큰, 재시도, 에러 매핑을 구현한다.
- [ ] Zod 스키마는 모듈 단위로 정의하고 `schema` 옵션으로 전달하도록 강제한다.
- [ ] Storybook 혹은 테스트 환경에서 사용할 목업 fetcher를 추가해 동일 인터페이스로 주입한다.
- [ ] 공통 로깅 유틸(`logApiRequest/logApiResponse/logApiError`)을 통해 서버/클라이언트 로그 형식을 통일한다.
- [ ] Sentry와 같은 APM 연동 시 로깅 유틸 내부에서 트레이스/브레드크럼을 기록하도록 확장한다.

주의사항
- 클라이언트에서 외부 도메인을 호출할 경우 CORS 허용을 확인한다.
- FormData는 파일 외 JSON 메타데이터를 `JSON.stringify` 후 텍스트 필드로 넣는 패턴을 따른다.
- 서버의 fetch는 Edge/Node 전부 지원하지만 ky는 브라우저 전용으로만 사용한다.
- 서버가 `{ code, message, details }` 구조로 오류를 반환하면 `afterResponse`에서 팀 표준 포맷으로 변환한다.

추가 고려 사항
- 인증 정보 공급원을 환경별로 분리한다. (예: 클라이언트는 storage, 서버는 cookies/headers)
- ky/ fetch 재시도 정책을 명시하고, 재시도 로그도 공통 유틸에서 처리한다.
- ApiError는 상위 레이어(React Query onError 등)에서 추가 로깅·사용자 피드백으로 연결한다. Sentry 연동 시 ApiError를 변환해 전송한다.
- 장기적으로는 Rate Limit, Circuit Breaker 등도 동일 인터페이스에 플러그인 방식으로 추가한다.

로깅 아키텍처
- `src/lib/api/api-logger.ts`는 콘솔 로그를 표준화하고 Sentry와 같은 APM을 붙일 수 있도록 확장 포인트를 노출한다.
- `src/lib/api/response-snippet.ts`는 Response 객체를 clone 후 요약 문자열을 생성해 민감한 데이터 노출 없이 에러 로그를 남길 수 있게 한다.
