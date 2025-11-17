"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { clientHttp } from "@shared/lib/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import { Spinner } from "@ui/shadcn/components/spinner";
import { toast } from "sonner";
import AdminCategoryItem from "../_components/AdminCategoryItem";
import { useCategoriesQuery } from "../_hooks/useCategoriesQuery";

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
          disabled={isRefetching ?? false}
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
          <AdminCategoryItem
            key={item.id}
            item={item}
            isPending={isPending}
            onDelete={async (id) => {
              await mutateAsync(id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminCategoryList;
