/**
 * @description ISO 날짜 문자열을 YYYY.MM.DD 형식으로 변환합니다.
 * @param isoString ISO 8601 형식의 날짜 문자열입니다. (예: "2024-01-02T12:34:56Z")
 * @returns 포맷된 날짜 문자열 또는 입력이 없거나 파싱에 실패한 경우 null을 반환합니다.
 */
export const formatYmd = (isoString?: string | null): string | null => {
  if (!isoString) return null;

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};
