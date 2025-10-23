/**
 * @description 서버와 클라이언트가 공유하는 표준 API 에러 코드 모음입니다.
 * - 문자열 포맷은 `도메인.상세코드` 규칙을 따릅니다.
 */
export const ApiErrorCode = {
  /** 인증 정보가 누락되었거나 만료된 경우 */
  AUTH_UNAUTHORIZED: "AUTH.UNAUTHORIZED",
  /** 입력 값이 유효성 검사를 통과하지 못한 경우 */
  REQUEST_VALIDATION_FAILED: "REQUEST.VALIDATION_FAILED",
  /** 서버에서 예상치 못한 오류가 발생한 경우 */
  SYSTEM_INTERNAL_ERROR: "SYSTEM.INTERNAL_ERROR",
} as const;

/**
 * @description API 에러 코드의 타입 정의입니다.
 * - 클라이언트 분기 처리와 서버 응답 작성에 재사용합니다.
 */
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
