"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToParentElement,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@features/categories/actions";
import type { CategoryRow } from "@features/categories/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button, Switch } from "@ui/shadcn/components";
import { Spinner } from "@ui/shadcn/components/spinner";
import { cn } from "@ui/shadcn/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminCategoryItem from "../_components/AdminCategoryItem";
import { useCategoriesQuery } from "../_hooks/useCategoriesQuery";

export interface AdminCategoryListProps {
  initialCategories: CategoryRow[];
}

const SortableCard = ({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const AdminCategoryList = ({ initialCategories }: AdminCategoryListProps) => {
  const { categories, error, isRefetching, refetch } =
    useCategoriesQuery(initialCategories);
  const queryClient = useQueryClient();

  const { mutateAsync: deleteAsync, isPending: isDeleting } = useMutation({
    mutationFn: (categoryId: number) => deleteCategoryAction(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리 삭제에 성공했습니다.");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      ),
  });

  const [ordered, setOrdered] = useState<CategoryRow[]>(categories);
  useEffect(() => {
    setOrdered(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const itemIds = useMemo(() => ordered.map((c) => c.id), [ordered]);
  const [isEditOrder, setIsEditOrder] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((c) => c.id === active.id);
    const newIndex = ordered.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    if (isEditOrder) {
      saveOrder(next);
    }
  };

  const { mutate: saveOrder, isPending: isSavingOrder } = useMutation({
    mutationFn: async (nextOrder: CategoryRow[]) => {
      const orderings = nextOrder.map((c, idx) => ({
        id: c.id,
        sortOrder: idx,
      }));
      await reorderCategoriesAction({ orderings });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("정렬을 저장했습니다.");
      setIsEditOrder(false);
    },
    onError: () => {
      toast.error("정렬 저장에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 border rounded-lg p-6 text-center">
        <div className="text-destructive font-medium">{error}</div>
        <Button
          variant="outline"
          onClick={() => {
            void refetch();
          }}
          disabled={isRefetching}
          size="sm"
        >
          {isRefetching ? (
            <Spinner className="size-4" />
          ) : (
            <Icon name="RefreshCcw" className="size-4" />
          )}{" "}
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
            <Switch
              checked={isEditOrder}
              onCheckedChange={(checked) => setIsEditOrder(!!checked)}
              disabled={isSavingOrder}
              id="toggle-reorder-mode"
            />
            <label htmlFor="toggle-reorder-mode" className="cursor-pointer">
              정렬 모드
            </label>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void refetch();
            }}
            disabled={isRefetching}
            size="sm"
          >
            {isRefetching ? (
              <Spinner className="size-3" />
            ) : (
              <Icon name="RefreshCcw" className="size-3" />
            )}{" "}
            새로고침
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
          isSavingOrder && "opacity-50 pointer-events-none",
        )}
      >
        {isEditOrder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[
              restrictToParentElement,
              restrictToFirstScrollableAncestor,
              restrictToWindowEdges,
            ]}
          >
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
              {ordered.map((item, idx) => (
                <SortableCard key={item.id} id={item.id}>
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground shadow">
                      {idx + 1}
                    </span>
                    <AdminCategoryItem
                      item={item}
                      isPending={isDeleting || isSavingOrder}
                      onDelete={(id) => deleteAsync(id)}
                    />
                  </div>
                </SortableCard>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          ordered.map((item) => (
            <AdminCategoryItem
              key={item.id}
              item={item}
              isPending={isDeleting}
              onDelete={(id) => deleteAsync(id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategoryList;
