"use client";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
} from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import {
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@ui/shadcn/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";
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

/**
 * @description Callout 커스텀 블럭 스펙 정의
 */
const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      type: {
        default: "info",
        values: ["info", "warning", "error", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { type } = props.block.props;
      const Icon = {
        info: Info,
        warning: AlertTriangle,
        error: AlertCircle,
        success: CheckCircle,
      }[type as "info" | "warning" | "error" | "success"];

      const styles = {
        info: "bg-blue-100/50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-800/50 dark:text-blue-200",
        warning:
          "bg-yellow-100/50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/10 dark:border-yellow-800/50 dark:text-yellow-200",
        error:
          "bg-red-100/50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-800/50 dark:text-red-200",
        success:
          "bg-green-100/50 border-green-200 text-green-900 dark:bg-green-900/10 dark:border-green-800/50 dark:text-green-200",
      }[type as "info" | "warning" | "error" | "success"];

      return (
        <div
          className={cn(
            "flex items-start w-full gap-3 p-4 rounded-lg border my-2",
            styles,
          )}
        >
          <div className="mt-0.5 shrink-0" contentEditable={false}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0" ref={props.contentRef} />
        </div>
      );
    },
  },
);

/**
 * @description 슬래시 메뉴에 Callout 항목 추가를 위한 유틸리티
 */
const insertCallout = (editor: any) => {
  insertOrUpdateBlock(editor, {
    type: "callout",
  });
};

export type BlockNoteEditorProps = {
  /**
   * @description 에디터 문서가 변경될 때마다 JSON 문자열 형태로 변경 내용을 전달합니다.
   * - JSON.parse를 통해 BlockNote 문서 객체로 복원할 수 있습니다.
   */
  onChange?: (contentJson: string) => void;
  /**
   * @description 초기 BlockNote 문서 JSON 문자열입니다.
   * - 편집 화면에서 기존 본문을 불러올 때 사용합니다.
   */
  initialContentJson?: string | null;
};

export default function BlockNoteEditor({
  onChange,
  initialContentJson,
}: BlockNoteEditorProps) {
  const locale = ko;
  const { theme } = useTheme();
  const [focus, setFocus] = useState<boolean>(false);

  const schema = useMemo(
    () =>
      BlockNoteSchema.create({
        blockSpecs: {
          ...defaultBlockSpecs,
          callout: CalloutBlock(),
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
  const dictionary = useMemo(
    () => ({
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/' 를 눌러 명령어를 실행하세요.",
      },
    }),
    [locale],
  );

  const initialContent = useMemo(() => {
    if (!initialContentJson) return undefined;
    try {
      return JSON.parse(initialContentJson) as unknown;
    } catch {
      return undefined;
    }
  }, [initialContentJson]);

  const editor = useCreateBlockNote(
    {
      schema,
      dictionary,
      ...(initialContent ? { initialContent: initialContent as never } : {}),
    },
    // 의도적으로 schema만 의존성에 포함해 에디터 인스턴스를 한 번만 생성합니다.
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
      slashMenu={false}
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
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            [
              ...getDefaultReactSlashMenuItems(editor),
              {
                title: "콜아웃",
                onItemClick: () => insertCallout(editor),
                aliases: ["callout", "notice", "info", "warning"],
                group: "기타",
                icon: <Lightbulb size={18} />,
                subtext: "강조하고 싶은 정보를 입력하세요.",
              },
            ],
            query,
          )
        }
      />
    </BlockNoteView>
  );
}
