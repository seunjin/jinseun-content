/**
 * @description 서버와 클라이언트가 공유하는 표준 API 에러 코드 모음입니다.
 * - 문자열 포맷은 `도메인.상세코드` 규칙을 따릅니다.
 */
export const ApiErrorCode = {
  /** http status: 200 */
  OK: "OK",
  /** http status: 201 */
  CREATED: "Created",
  /** http status: 400 */
  BAD_REQUEST: "Bad Request",
  /** http status: 401 */
  UNAUTHORIZED: "Unauthorized",
  /** http status: 403 */
  FORBIDDEN: "Forbidden",
  /** http status: 404 */
  NOT_FOUND: "Not Found",
  /** http status: 500 */
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

/**
 * @description API 에러 코드의 타입 정의입니다.
 * - 클라이언트 분기 처리와 서버 응답 작성에 재사용합니다.
 */
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
