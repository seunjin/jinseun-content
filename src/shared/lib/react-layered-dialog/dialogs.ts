import Alert from "@ui/components/dialogs/Alert";
import Confirm from "@ui/components/dialogs/Confirm";
import Modal from "@ui/components/dialogs/Modal";
import { createDialogApi, DialogStore } from "react-layered-dialog";

/**
 * 다이얼로그 공통 옵션 타입
 *
 * - 타입 이름/필드명은 영어로 유지하고, 각 필드의 의미는 한글 주석으로 설명합니다.
 */
export type BaseDialogOptions = {
  /**
   * 배경(backdrop) 클릭 시 닫을지 여부 (컴포넌트별 지원 여부 상이)
   */
  closeOnBackdrop?: boolean;
  /**
   * 배경 딤(blur/overlay) 처리 여부. `true`면 배경 클릭 가능 상태로 렌더링됩니다.
   */
  dimmed?: boolean;
  /**
   * 다이얼로그가 열려 있는 동안 문서(body) 스크롤 잠금 여부
   * - true: body 스크롤을 잠그고, 닫히면 해제합니다.
   * - false: 스크롤 잠금을 적용하지 않습니다.
   */
  lockScroll?: boolean;
  /**
   * Escape 키 입력으로 닫을지 여부
   * - Alert/Confirm: 기본적으로 true 권장 (Esc로 닫기/취소)
   * - Modal: 기본적으로 true 권장 (Esc로 닫기)
   */
  closeOnEsc?: boolean;
};

/**
 * 앱 전역에서 사용하는 다이얼로그 API 정의
 *
 * - `alert`: 단일 확인 버튼 다이얼로그
 * - `confirm`: 확인/취소 다이얼로그 (`mode: 'async'`)
 * - `modal`: 콘텐츠 컨테이너(오버레이)
 */
export const dialog = createDialogApi(new DialogStore(), {
  alert: { component: Alert },
  confirm: { component: Confirm, mode: "async" },
  modal: { component: Modal },
});

/** 다이얼로그 열기 (동기) */
export const openDialog = dialog.open;
/** 다이얼로그 열기 (비동기, `confirm`과 함께 사용) */
export const openDialogAsync = dialog.openAsync;
/** 특정 다이얼로그 닫기 */
export const closeDialog = dialog.close;
/** 모든 다이얼로그 닫기 */
export const closeAllDialogs = dialog.closeAll;
/** 열린 다이얼로그 상태 업데이트 */
export const updateDialog = dialog.update;
