"use client";
import type { BlockNoteEditorProps } from "@ui/components/editor/BlockNoteEditor";
import dynamic from "next/dynamic";

export const DynamicEditor = dynamic<BlockNoteEditorProps>(
  () => import("@ui/components/editor/BlockNoteEditor"),
  {
    ssr: false,
  },
);

const Editor = (props: BlockNoteEditorProps) => {
  return <DynamicEditor {...props} />;
};

export default Editor;
