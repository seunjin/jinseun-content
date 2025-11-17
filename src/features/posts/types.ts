/**
 * 게시글 요약 정보 타입
 * - 목록 카드에 필요한 최소 필드만 포함합니다.
 */
export type PostSummary = {
  /** 고유 식별자 */
  id: number;
  /** 사람 친화적인 주소 식별자(slug) */
  slug: string;
  /** 제목 */
  title: string;
  /** 카테고리 표시 이름 */
  categoryName?: string;
  /** 썸네일 이미지 URL (옵션) */
  thumbnailUrl?: string | null;
  /** 발행 여부(true=발행, false=초안) */
  isPublished: boolean;
  /** 최종 수정 시각(ISO 문자열) */
  updatedAt?: string | null;
};
