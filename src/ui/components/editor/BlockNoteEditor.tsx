"use client";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@ui/shadcn/lib/utils";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";

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

export type BlockNoteEditorProps = {
  /**
   * @description 에디터 문서가 변경될 때마다 JSON 문자열 형태로 변경 내용을 전달합니다.
   * - JSON.parse를 통해 BlockNote 문서 객체로 복원할 수 있습니다.
   */
  onChange?: (contentJson: string) => void;
};

export default function BlockNoteEditor({ onChange }: BlockNoteEditorProps) {
  const locale = ko;
  const { theme } = useTheme();
  const [focus, setFocus] = useState<boolean>(false);

  const schema = useMemo(
    () =>
      BlockNoteSchema.create({
        blockSpecs: {
          ...defaultBlockSpecs,
          codeBlock: createCodeBlockSpec({
            indentLineWithTab: true,
            defaultLanguage: "typescript",
            supportedLanguages: CODE_BLOCK_LANGUAGES,

            // 일단 createHighlighter는 비워 두고 언어만 테스트
            createHighlighter: async () => {
              const { createHighlighter } = await import("shiki");

              const highlighter = await createHighlighter({
                themes: [CODE_BLOCK_THEME],
                langs: [...CODE_BLOCK_LANGUAGE_KEYS],
              });
              const originalCodeToTokens =
                highlighter.codeToTokens.bind(highlighter);

              type OriginalOptions = Parameters<typeof originalCodeToTokens>[1];

              const ensureThemeOption = (
                options?: OriginalOptions,
              ): OriginalOptions => {
                if (options && "themes" in options && options.themes) {
                  return {
                    ...options,
                    themes: {
                      ...options.themes,
                      light: CODE_BLOCK_THEME,
                      dark: CODE_BLOCK_THEME,
                    },
                  };
                }

                return {
                  ...(options ?? {}),
                  theme: CODE_BLOCK_THEME,
                } as OriginalOptions;
              };

              const patchedCodeToTokens: typeof highlighter.codeToTokens = (
                code,
                options,
              ) => {
                const finalOptions = ensureThemeOption(options);

                return originalCodeToTokens(code, finalOptions);
              };

              highlighter.codeToTokens = patchedCodeToTokens;

              return highlighter;
            },
          }),
        },
      }),
    [],
  );

  // 언어 설정
  const dictionary = {
    ...locale,
    placeholders: {
      ...locale.placeholders,
      emptyDocument: "텍스트를 입력하거나 '/' 를 눌러 명령어를 실행하세요.",
    },
  };
  const editor = useCreateBlockNote(
    {
      schema,
      dictionary,
    },
    [schema],
  );

  return (
    <BlockNoteView
      className={cn(
        "py-4",
        "border-input rounded-md border dark:bg-input/30 bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
        focus && "border-ring ring-ring/50 ring-[3px] ",
      )}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      theme={theme === "dark" ? "dark" : "light"}
      editor={editor}
      onChange={() => {
        if (!onChange) return;
        try {
          const doc = editor.document;
          const json = JSON.stringify(doc);
          onChange(json);
        } catch {
          // 직렬화 실패 시에는 조용히 무시합니다.
        }
      }}
    />
  );
}
