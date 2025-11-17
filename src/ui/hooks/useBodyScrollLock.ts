"use client";

import { useEffect, useRef } from "react";

// 전역 잠금 카운트: 여러 다이얼로그가 동시에 열릴 때를 고려
let lockCount = 0;
let previousOverflow: string | null = null;

const applyGlobalLock = () => {
  const body = document.body;
  const html = document.documentElement;
  if (lockCount === 0) {
    previousOverflow = body.style.overflow || "";
    body.classList.add("scroll-locked");
    body.dataset.dialogScrollLock = "true";
    html.dataset.dialogScrollLock = "true";
    body.style.overflow = "hidden"; // CSS 보조 없이도 확실히 잠금
  }
  lockCount += 1;
};

const releaseGlobalLock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement;
    body.classList.remove("scroll-locked");
    delete body.dataset.dialogScrollLock;
    delete html.dataset.dialogScrollLock;
    if (previousOverflow !== null) {
      body.style.overflow = previousOverflow;
      previousOverflow = null;
    }
  }
};

/**
 * 다이얼로그 등 오버레이가 열리는 동안 body 스크롤을 잠그는 훅
 * - enabled=true일 때 잠그고, 컴포넌트 언마운트 또는 enabled=false로 전환 시 해제합니다.
 * - 다중 인스턴스를 고려해 전역 카운팅으로 관리합니다.
 */
export function useBodyScrollLock(enabled: boolean) {
  const lockedRef = useRef(false);

  useEffect(() => {
    // SSR 안전장치
    if (typeof document === "undefined") return;

    if (enabled && !lockedRef.current) {
      applyGlobalLock();
      lockedRef.current = true;
    }
    if (!enabled && lockedRef.current) {
      releaseGlobalLock();
      lockedRef.current = false;
    }

    return () => {
      if (lockedRef.current) {
        releaseGlobalLock();
        lockedRef.current = false;
      }
    };
  }, [enabled]);
}
