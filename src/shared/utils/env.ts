/**
 * @description 환경 변수를 안전하게 확인하고 반환하는 유틸리티 모음입니다.
 */

/**
 * @description 이미 읽어 온 환경 변수 값이 존재하는지 확인하고 없으면 예외를 던집니다.
 * @param key 확인할 환경 변수 이름입니다.
 * @param value 선행 조회한 환경 변수 값입니다.
 * @returns 유효한 환경 변수 문자열을 반환합니다.
 * @throws Error 환경 변수가 비어 있거나 정의되지 않은 경우 발생합니다.
 */
export const assertEnv = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${key} 환경 변수가 설정되어 있지 않습니다.`);
  }
  return value;
};

/**
 * @description process.env에서 직접 환경 변수를 조회하고 없으면 예외를 던집니다.
 * @param key 조회할 환경 변수 이름입니다.
 * @returns 유효한 환경 변수 문자열을 반환합니다.
 * @throws Error 환경 변수가 비어 있거나 정의되지 않은 경우 발생합니다.
 */
export const requireEnv = (key: string) => assertEnv(key, process.env[key]);
