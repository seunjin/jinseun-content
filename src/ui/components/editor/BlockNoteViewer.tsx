"use client";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@ui/shadcn/lib/utils";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { createCustomSchema } from "./schema";

const CODE_BLOCK_LANGUAGES: Record<
  string,
  { name: string; aliases?: string[] }
> = {
  typescript: { name: "TypeScript", aliases: ["ts"] },
  tsx: { name: "TSX", aliases: ["tsx"] },
  javascript: { name: "JavaScript", aliases: ["js"] },
  jsx: { name: "JSX", aliases: ["jsx"] },
  json: { name: "JSON" },
  css: { name: "CSS" },
  html: { name: "HTML" },
  yaml: {
    name: "YAML",
    aliases: ["yml"],
  },
  markdown: { name: "Markdown", aliases: ["md"] },
};
const CODE_BLOCK_LANGUAGE_KEYS = ["typescript", "javascript", "json"] as const;
const CODE_BLOCK_THEME = "one-dark-pro" as const;

export type BlockNoteViewerProps = {
  /**
   * @description BlockNote 에디터에서 직렬화한 문서 JSON 문자열입니다.
   * - 유효한 JSON이 아닌 경우 뷰어는 빈 문서를 렌더링합니다.
   */
  contentJson?: string | null;
  /** @description 추가 컨테이너 클래스 이름입니다. */
  className?: string;
};

/**
 * @description BlockNote 기반 문서 뷰어 컴포넌트입니다.
 * - 에디터에서 저장한 JSON 문자열을 읽기 전용으로 렌더링합니다.
 */
const BlockNoteViewer = ({ contentJson, className }: BlockNoteViewerProps) => {
  const locale = ko;
  const { theme } = useTheme();

  const schema = useMemo(() => createCustomSchema(), []);

  const dictionary = {
    ...locale,
  };

  const initialContent = useMemo(() => {
    if (!contentJson) return undefined;
    try {
      return JSON.parse(contentJson) as unknown;
    } catch {
      return undefined;
    }
  }, [contentJson]);

  const editor = useCreateBlockNote(
    {
      schema,
      dictionary,
      // BlockNote 문서 구조는 에디터에서 직렬화한 값을 그대로 사용합니다.
      initialContent: initialContent as never,
    },
    [schema, dictionary, initialContent],
  );

  if (!initialContent) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground",
          className,
        )}
      >
        작성된 본문이 없습니다.
      </div>
    );
  }

  return (
    <BlockNoteView
      className={cn("py-4", "dark:bg-input/30 bg-transparent", className)}
      theme={theme === "dark" ? "dark" : "light"}
      editor={editor}
      editable={false}
    />
  );
};

export default BlockNoteViewer;
