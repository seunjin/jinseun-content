"use client";
import dynamic from "next/dynamic";

export const DynamicEditor = dynamic(
  () => import("@ui/components/editor/BlockNoteEditor"),
  {
    ssr: false,
  },
);
const Editor = () => {
  return <DynamicEditor />;
};

export default Editor;
