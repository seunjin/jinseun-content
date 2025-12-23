import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { cn } from "@ui/shadcn/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export const CODE_BLOCK_LANGUAGES: Record<
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

export const CODE_BLOCK_LANGUAGE_KEYS = [
  "typescript",
  "javascript",
  "json",
] as const;
export const CODE_BLOCK_THEME = "one-dark-pro" as const;

export const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      type: {
        default: "beige",
        values: ["beige", "info", "warning", "error", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props: {
      block: {
        props: {
          type: "beige" | "info" | "warning" | "error" | "success";
        };
      };
      contentRef: (instance: HTMLDivElement | null) => void;
    }) => {
      const { type } = props.block.props;
      const Icon = {
        beige: null,
        info: Info,
        warning: AlertTriangle,
        error: AlertCircle,
        success: CheckCircle,
      }[type as "beige" | "info" | "warning" | "error" | "success"];

      const styles = {
        beige:
          "bg-[#F9F8F7] border-[#F9F8F7] text-[#37352f] dark:bg-[#2f2f2c] dark:border-[#2f2f2c] dark:text-[#ebeded]",
        info: "bg-blue-100/50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-800/50 dark:text-blue-200",
        warning:
          "bg-yellow-100/50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/10 dark:border-yellow-800/50 dark:text-yellow-200",
        error:
          "bg-red-100/50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-800/50 dark:text-red-200",
        success:
          "bg-green-100/50 border-green-200 text-green-900 dark:bg-green-900/10 dark:border-green-800/50 dark:text-green-200",
      }[type as "beige" | "info" | "warning" | "error" | "success"];

      return (
        <div
          className={cn(
            "flex items-start w-full gap-3 p-4 rounded-lg border my-2",
            styles,
          )}
        >
          {Icon && (
            <div className="mt-0.5 shrink-0" contentEditable={false}>
              <Icon size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0" ref={props.contentRef} />
        </div>
      );
    },
  },
);

export const createCustomSchema = () => {
  return BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      callout: CalloutBlock(),
      codeBlock: createCodeBlockSpec({
        indentLineWithTab: true,
        defaultLanguage: "typescript",
        supportedLanguages: CODE_BLOCK_LANGUAGES,
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
  });
};
