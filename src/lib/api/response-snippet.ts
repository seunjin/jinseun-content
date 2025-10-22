/**
 * @description Response 객체에서 본문 요약을 추출합니다.
 * - 로그 전용이며, 응답 스트림은 clone()한 뒤 읽어 안전하게 사용합니다.
 */
export const extractResponseSnippet = async (response: Response) => {
  try {
    const clone = response.clone();
    const contentType = clone.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("application/json")) {
      const json = await clone.json().catch(() => undefined);
      if (json === undefined) return "JSON 본문 파싱 실패";
      return safeStringify(json);
    }

    if (contentType.startsWith("text/")) {
      const text = await clone.text();
      return text
        ? text.replace(/\s+/g, " ").slice(0, 160)
        : "본문이 비어 있습니다.";
    }

    return `${contentType || "unknown"} 응답(본문 미노출)`;
  } catch (error) {
    if (error instanceof Error) {
      return `본문 스니펫 생성 실패: ${error.message}`;
    }
    return "본문 스니펫 생성 실패";
  }
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value).slice(0, 160);
  } catch {
    return "JSON 문자열화 실패";
  }
};
