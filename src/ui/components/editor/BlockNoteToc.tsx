"use client";

import { cn } from "@ui/shadcn/lib/utils";
import { useEffect, useState } from "react";

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
          if (outer) {
            outer.setAttribute("id", targetId);
          } else if (headingEl) {
            headingEl.setAttribute("id", targetId);
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

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={cn("text-xs text-muted-foreground", className)}>
      <p className="mb-2 font-medium">목차</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
            <button
              type="button"
              className="w-full text-left hover:text-foreground"
              onClick={() => {
                const root = document.querySelector<HTMLElement>(rootSelector);
                if (!root) return;

                const target =
                  root.querySelector<HTMLElement>(`[data-id="${item.id}"]`) ??
                  root.querySelector<HTMLElement>(`#${item.id}`);

                if (target) {
                  target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BlockNoteToc;
