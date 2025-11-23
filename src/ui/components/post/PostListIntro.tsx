import type { CategoryRow } from "@features/categories/schemas";

export type PostListIntroProps = {
  /**
   * @description 선택된 카테고리 정보입니다.
   * - 카테고리가 없는 경우(null) 전체 블로그 소개 문구를 표시합니다.
   */
  category: CategoryRow | null;
};

/**
 * @description 블로그 / 카테고리 소개 인용문 섹션 컴포넌트입니다.
 * - 루트에서는 블로그 전체에 대한 소개를, 카테고리 선택 시 해당 카테고리 설명을 표시합니다.
 */
const PostListIntro = ({ category }: PostListIntroProps) => {
  return (
    <section className="relative overflow-hidden border-b border-foreground/10 ">
      <div className="relative mb-6 space-y-2">
        {category ? (
          <>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
              WORK LOG · DEV NOTES
            </p>
            <p className="text-base font-medium text-foreground">
              {category.name.toUpperCase()}
            </p>
            <p className="break-keep text-balance text-muted-foreground/80">
              {category.description ??
                `${category.name} 카테고리에 속한 글들을 모아봤어요.`}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
              WORK LOG · DEV NOTES
            </p>
            <p className="text-base font-medium text-foreground">
              배우고, 만들고, 기록합니다.
            </p>
            <p className="break-keep text-balance text-muted-foreground/80">
              새로운 기술을 탐구하고 직접 구현해보는 과정, 문제 해결 경험,
              프로젝트 회고, 그리고 나만의 개발 철학을 정리합니다. “오늘의
              배움이 내일의 기반이 된다”는 마음으로, 꾸준히 생각을 쌓고
              기록합니다.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default PostListIntro;
