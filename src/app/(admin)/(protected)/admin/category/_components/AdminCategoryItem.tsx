"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { dialog } from "@shared/lib/react-layered-dialog/dialogs";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/shadcn/components/dropdown-menu";
import { Spinner } from "@ui/shadcn/components/spinner";
import UpdateCategoryModal from "../_templates/UpdateCategoryModal";

/**
 * 관리자 카테고리 리스트의 단일 아이템 컴포넌트
 *
 * - 카테고리 정보 표시(이름, 슬러그, 설명, 수정일)
 * - 더보기 메뉴를 통해 수정 모달/삭제 확인을 제공
 */
export interface AdminCategoryItemProps {
  /** 표시할 카테고리 레코드 */
  item: CategoryRow;
  /** 삭제 요청 진행 중 여부(비활성화 처리용) */
  isPending?: boolean;
  /** 삭제 핸들러(호출 측에서 뮤테이션 주입) */
  onDelete: (categoryId: number) => Promise<unknown>;
}

const AdminCategoryItem = ({
  item,
  isPending,
  onDelete,
}: AdminCategoryItemProps) => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] group border rounded-xl bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 ">
      {/* 헤더: 이름/슬러그 + 상태 + 메뉴 */}
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3 transition-colors group-hover:bg-primary/5">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">
            {item.name}
          </span>
          <span className="text-xs text-muted-foreground">
            slug: {item.slug}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              item.isVisible
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            {item.isVisible ? "visible" : "hidden"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="transition-opacity focus-visible:opacity-100"
                onClick={(event) => {
                  // 카드 클릭 전파 방지
                  event.stopPropagation();
                }}
              >
                <Icon name="MoreVertical" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => {
                  dialog.modal({
                    children: <UpdateCategoryModal categoryId={item.id} />,
                  });
                }}
              >
                <Icon name="Pencil" className="size-3" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                disabled={isPending}
                onSelect={async () => {
                  await dialog.confirm(({ setStatus, close }) => ({
                    title: "카테고리 삭제",
                    message: (
                      <>
                        <b className="font-semibold text-foreground">
                          "{item.name}"
                        </b>
                        을/를 삭제하시겠습니까? 해당 카테고리와 관련된 글은 모두
                        비공개 처리됩니다.
                      </>
                    ),
                    confirmButtonText: "삭제하기",
                    cancelButtonText: "취소",
                    onConfirm: async () => {
                      setStatus("loading");
                      await onDelete(item.id);
                      close();
                    },
                  }));
                }}
              >
                {isPending ? (
                  <Spinner className="size-3" />
                ) : (
                  <Icon name="Trash2" className="size-3" />
                )}
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 본문: 설명 */}
      <div className="px-4 py-3 text-sm text-muted-foreground">
        {item.description?.trim() ? (
          <p className="line-clamp-3">{item.description}</p>
        ) : (
          <span className="italic text-muted-foreground/70">
            소개 문구가 없습니다.
          </span>
        )}
      </div>

      {/* 푸터: 수정일 */}
      <div className="flex items-center justify-end border-t px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="CalendarClock" size={14} />
          <span>
            수정:{" "}
            {item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString("ko-KR")
              : "알 수 없음"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryItem;
