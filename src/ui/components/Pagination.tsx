import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";

export type PaginationProps = {
  /** 현재 페이지 번호(1부터 시작) */
  currentPage: number;
  /** 전체 페이지 개수(1 이상) */
  totalPages: number;
  /**
   * @description 페이지 번호를 받아 이동할 href를 생성하는 함수입니다.
   * - 예: (page) => `/?page=${page}`
   */
  buildHref: (page: number) => string;
  /** 외부에서 전달할 추가 클래스 이름 */
  className?: string;
};

/**
 * @description Prev / 1 2 3 4 5 / Next 스타일의 페이지네이션 컴포넌트입니다.
 * - 전체 페이지 개수(totalPages)를 기준으로 최대 5개의 페이지 버튼을 표시합니다.
 * - 현재 페이지 주변을 중심으로 윈도우를 구성해 긴 페이지 목록도 간결하게 보여줍니다.
 */
const Pagination = ({
  currentPage,
  totalPages,
  buildHref,
  className,
}: PaginationProps) => {
  const visiblePages: number[] = [];

  /**
   * @description startPage~endPage 구간 안의 숫자 버튼만 노출합니다.
   * - 전체 페이지가 5개 이하인 경우: 1~totalPages 전체 표시
   * - 6개 이상인 경우:
   *    - 1~3페이지: 1~5
   *    - 마지막 3페이지: totalPages-4 ~ totalPages
   *    - 그 외: currentPage-2 ~ currentPage+2
   */
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > 5) {
    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
    if (pageNumber < 1) continue;
    visiblePages.push(pageNumber);
  }

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      className={cn(
        "flex items-center justify-center gap-3 text-sm",
        className,
      )}
      aria-label="페이지네이션"
    >
      {/* Prev 링크 */}
      <Link
        href={buildHref(prevPage)}
        className={cn(
          "px-1.5 py-0.5 text-foreground/30",
          currentPage <= 1 ? "pointer-events-none" : "hover:text-foreground",
        )}
        aria-disabled={currentPage <= 1}
      >
        Prev
      </Link>

      {/* 페이지 번호들 (타이포 스타일) */}
      {visiblePages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildHref(pageNumber)}
          className={cn(
            "text-foreground/50 px-1.5 py-0.5",
            pageNumber === currentPage
              ? "font-semibold text-foreground"
              : "hover:text-foreground",
          )}
          aria-current={pageNumber === currentPage ? "page" : undefined}
        >
          {pageNumber}
        </Link>
      ))}

      {/* Next 링크 */}
      <Link
        href={buildHref(nextPage)}
        className={cn(
          "px-1.5 py-0.5 text-foreground/30",
          currentPage >= totalPages
            ? "pointer-events-none"
            : "hover:text-foreground",
        )}
        aria-disabled={currentPage >= totalPages}
      >
        Next
      </Link>
    </nav>
  );
};

export default Pagination;
