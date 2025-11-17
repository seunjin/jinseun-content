"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { dialog } from "@shared/lib/react-layered-dialog/dialogs";
import { clientHttp } from "@shared/lib/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";

import { Button } from "@ui/shadcn/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/shadcn/components/dropdown-menu";
import { Spinner } from "@ui/shadcn/components/spinner";
import { useCategoriesQuery } from "../_hooks/useCategoriesQuery";
import UpdateCategoryModal from "./UpdateCategoryModal";
import Modal from "@ui/components/dialogs/Modal";
import { toast } from "sonner";

export interface AdminCategoryListProps {
  initialCategories: CategoryRow[];
}

const AdminCategoryList = ({ initialCategories }: AdminCategoryListProps) => {
  const { categories, error, isRefetching, refetch } =
    useCategoriesQuery(initialCategories);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (categoryId: number) =>
      clientHttp.delete<{ response: { deleted: true } }>(
        `/api/categories/${categoryId}`,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리 삭제에 성공했습니다.");
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 border rounded-lg p-6 text-center">
        <div className="text-destructive">{error}</div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          size="sm"
        >
          {isRefetching ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <Icon name="RefreshCcw" className="mr-2 size-4" />
          )}
          다시 시도
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        아직 생성된 카테고리가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{`Total (${categories.length})`}</span>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          size="sm"
        >
          {isRefetching ? (
            <Spinner className="size-3" />
          ) : (
            <Icon name="RefreshCcw" className="size-3" />
          )}
          새로고침
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className="grid grid-rows-[auto_1fr_auto] group border rounded-xl bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 "
          >
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
                          children: (
                            <UpdateCategoryModal categoryId={item.id} />
                          ),
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
                        // event.preventDefault();
                        // event.stopPropagation();
                        await dialog.confirm(({ setStatus, close }) => ({
                          title: "카테고리 삭제",
                          message: (
                            <>
                              <b className="font-semibold text-foreground">
                                "{item.name}"
                              </b>
                              을/를 삭제하시겠습니까? 해당 카테고리와 관련된
                              글은 모두 비공개 처리됩니다.
                            </>
                          ),
                          confirmButtonText: "삭제하기",
                          cancelButtonText: "취소",
                          onConfirm: async () => {
                            setStatus("loading");
                            await mutateAsync(item.id);
                            close();
                          },
                        }));
                      }}
                    >
                      <Icon name="Trash2" className="size-3" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {item.description?.trim() ? (
                <p className="line-clamp-3">{item.description}</p>
              ) : (
                <span className="italic text-muted-foreground/70">
                  소개 문구가 없습니다.
                </span>
              )}
            </div>
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
        ))}
      </div>
    </div>
  );
};

export default AdminCategoryList;
