"use client";
import "@blocknote/core/fonts/inter.css";

import { filterSuggestionItems, insertOrUpdateBlock } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import {
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
import { createCustomSchema } from "./schema";

/**
 * @description 슬래시 메뉴에 Callout 항목 추가를 위한 유틸리티
 */
// biome-ignore lint/suspicious/noExplicitAny: BlockNote editor types can be complex with custom schemas
const insertCallout = (
  editor: any,
  type: "beige" | "info" | "warning" | "error" | "success" = "beige",
) => {
  insertOrUpdateBlock(editor, {
    type: "callout",
    props: { type } as any,
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

  const schema = useMemo(() => createCustomSchema(), []);

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
                title: "기본 콜아웃",
                onItemClick: () => insertCallout(editor, "beige"),
                aliases: ["callout", "beige", "notion", "기본", "콜아웃"],
                group: "콜아웃",
                icon: <Lightbulb size={18} />,
                subtext: "베이지색 배경의 기본 콜아웃을 삽입합니다.",
              },
              {
                title: "정보 콜아웃",
                onItemClick: () => insertCallout(editor, "info"),
                aliases: ["callout", "info", "notice", "정보", "공지"],
                group: "콜아웃",
                icon: <Info size={18} />,
                subtext: "정보 전달을 위한 파란색 콜아웃을 삽입합니다.",
              },
              {
                title: "경고 콜아웃",
                onItemClick: () => insertCallout(editor, "warning"),
                aliases: ["callout", "warning", "warn", "경고", "주의"],
                group: "콜아웃",
                icon: <AlertTriangle size={18} />,
                subtext:
                  "주의가 필요한 내용을 위한 노란색 콜아웃을 삽입합니다.",
              },
              {
                title: "에러 콜아웃",
                onItemClick: () => insertCallout(editor, "error"),
                aliases: ["callout", "error", "fail", "danger", "에러", "위험"],
                group: "콜아웃",
                icon: <AlertCircle size={18} />,
                subtext:
                  "심각한 오류나 경고를 위한 빨간색 콜아웃을 삽입합니다.",
              },
              {
                title: "성공 콜아웃",
                onItemClick: () => insertCallout(editor, "success"),
                aliases: [
                  "callout",
                  "success",
                  "check",
                  "done",
                  "성공",
                  "완료",
                ],
                group: "콜아웃",
                icon: <CheckCircle size={18} />,
                subtext:
                  "완료나 긍정적인 메시지를 위한 초록색 콜아웃을 삽입합니다.",
              },
            ],
            query,
          )
        }
      />
    </BlockNoteView>
  );
}
