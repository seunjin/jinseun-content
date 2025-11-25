"use client";

import { cn } from "@ui/shadcn/lib/utils";
import { useCallback, useEffect, useState } from "react";

export type BlockNoteTocProps = {
  /**
   * @description BlockNote 문서가 렌더링된 루트 컨테이너를 찾기 위한 셀렉터입니다.
   * - 기본값은 ".page-content-viwer" 입니다.
   */
  rootSelector?: string;
  /** @description 추가 컨테이너 클래스 이름입니다. */
  className?: string;
};

type TocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

/**
 * @description BlockNote 렌더 결과를 기반으로 동적으로 목차를 구성하는 컴포넌트입니다.
 * - H2/H3 수준의 헤딩을 추출해 좌측/우측 등 원하는 레이아웃에 배치할 수 있습니다.
 */
const BlockNoteToc = ({
  rootSelector = ".page-content-viwer",
  className,
}: BlockNoteTocProps) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const getScrollOffset = useCallback(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const fontSize =
      Number.parseFloat(rootStyle.getPropertyValue("font-size")) || 16;
    const toPx = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return 0;

      const numeric = Number.parseFloat(trimmed);
      if (!Number.isFinite(numeric)) return 0;

      if (trimmed.endsWith("rem")) {
        return numeric * fontSize;
      }

      return numeric;
    };

    const headerHeight = toPx(rootStyle.getPropertyValue("--header-height"));
    const toolbarHeight = toPx(
      rootStyle.getPropertyValue("--page-toolbar-height"),
    );
    const paddingTop = toPx(
      rootStyle.getPropertyValue("--main-container-padding-block-start"),
    );

    return headerHeight + toolbarHeight + paddingTop;
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) {
      setItems([]);
      return;
    }

    const computeToc = () => {
      const headingBlocks = root.querySelectorAll<HTMLElement>(
        '.bn-block-content[data-content-type="heading"][data-level="2"], .bn-block-content[data-content-type="heading"][data-level="3"]',
      );

      const nextItems: TocItem[] = [];

      headingBlocks.forEach((block, index) => {
        const headingEl =
          block.querySelector<HTMLHeadingElement>("h2, h3") ?? undefined;
        const text = headingEl?.textContent?.trim();
        if (!text) return;

        const outer = block.closest<HTMLElement>(
          '[data-node-type="blockOuter"]',
        );

        const dataId =
          outer?.getAttribute("data-id") ?? headingEl?.getAttribute("data-id");

        let targetId = dataId ?? outer?.id ?? headingEl?.id ?? "";
        if (!targetId) {
          targetId = `heading-${index}`;
        }

        // BlockNote에서 data-id를 항상 기준으로 사용하므로
        // data-id가 없는 경우에는 우리가 계산한 targetId로 data-id를 보강합니다.
        if (!dataId && targetId) {
          if (outer) {
            outer.setAttribute("data-id", targetId);
          } else if (headingEl) {
            headingEl.setAttribute("data-id", targetId);
          }
        }

        const levelAttr = block.getAttribute("data-level");
        const level: 2 | 3 = levelAttr === "3" ? 3 : 2;

        nextItems.push({ id: targetId, level, text });
      });

      setItems(nextItems);
    };

    // 초기 렌더 후 한 번 계산
    computeToc();

    // BlockNote가 비동기로 렌더링되므로 DOM 변화를 관찰해 목차를 갱신합니다.
    const observer = new MutationObserver(() => {
      computeToc();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [rootSelector]);

  // 현재 스크롤 기준으로 "마지막으로 기준선을 지난 섹션"을 활성 목차 아이템으로 표시합니다.
  useEffect(() => {
    if (items.length === 0) return;

    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    const offset = getScrollOffset();

    const getTargets = () =>
      items
        .map((item) => {
          const el = root.querySelector<HTMLElement>(`[data-id="${item.id}"]`);
          return el ? { item, el } : null;
        })
        .filter(
          (value): value is { item: TocItem; el: HTMLElement } =>
            value !== null,
        );

    const handleScroll = () => {
      const targets = getTargets();
      if (targets.length === 0) return;

      let currentId: string | null = targets[0]?.item.id ?? null;
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      for (const { item, el } of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.top - offset <= 0) {
          currentId = item.id;
        } else {
          break;
        }
      }

      // 페이지 하단 근처에서는 기준선을 넘기지 못하는 마지막 헤딩을 강제로 활성화합니다.
      if (documentHeight - scrollBottom <= 4 && targets.length > 0) {
        currentId = targets[targets.length - 1]?.item.id ?? currentId;
      }

      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items, rootSelector, getScrollOffset]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={cn("text-xs text-muted-foreground", className)}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded px-1 py-0.5 text-left text-xs transition-colors",
                activeId === item.id
                  ? "font-semibold text-foreground underline underline-offset-2"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                const root = document.querySelector<HTMLElement>(rootSelector);
                if (!root) return;

                const target = root.querySelector<HTMLElement>(
                  `[data-id="${item.id}"]`,
                );

                if (target) {
                  const offset = getScrollOffset();
                  const rect = target.getBoundingClientRect();
                  const absoluteTop = window.scrollY + rect.top;

                  // 헤더/툴바 높이만큼 보정해 원하는 위치에 정렬합니다.
                  window.scrollTo({
                    top: absoluteTop - offset + 1,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <span className="block truncate">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BlockNoteToc;
