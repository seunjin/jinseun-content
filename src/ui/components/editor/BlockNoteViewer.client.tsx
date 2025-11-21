"use client";

import dynamic from "next/dynamic";
import type { BlockNoteViewerProps } from "./BlockNoteViewer";

const DynamicBlockNoteViewer = dynamic<BlockNoteViewerProps>(
  () => import("./BlockNoteViewer"),
  {
    ssr: false,
  },
);

/**
 * @description BlockNoteViewer를 클라이언트 전용으로 로드하는 래퍼 컴포넌트입니다.
 * - 서버 컴포넌트에서 안전하게 사용할 수 있도록 SSR을 비활성화합니다.
 */
const BlockNoteViewerClient = (props: BlockNoteViewerProps) => {
  return <DynamicBlockNoteViewer {...props} />;
};

export default BlockNoteViewerClient;
