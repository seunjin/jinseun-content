"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CategoryRow } from "@features/categories/schemas";
import { clientHttp } from "@shared/lib/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import { Spinner } from "@ui/shadcn/components/spinner";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminCategoryItem from "../_components/AdminCategoryItem";
import { useCategoriesQuery } from "../_hooks/useCategoriesQuery";

export interface AdminCategoryListProps {
  initialCategories: CategoryRow[];
}

/**
 * 정렬 가능한 카드 래퍼 컴포넌트
 * - dnd-kit useSortable을 사용해 변환/전환 스타일과 드래그 이벤트 바인딩을 적용합니다.
 */
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

  // 삭제 뮤테이션
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useMutation({
    mutationFn: (categoryId: number) =>
      clientHttp.delete<{ response: { deleted: true } }>(
        `/api/categories/${categoryId}`,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리 삭제에 성공했습니다.");
    },
  });

  // 표시용 정렬 상태(드래그 앤 드랍)
  const [ordered, setOrdered] = useState<CategoryRow[]>(categories);
  useEffect(() => {
    setOrdered(categories);
  }, [categories]);

  // dnd-kit 센서(마우스 이동 일정 거리 후 활성화)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const itemIds = useMemo(() => ordered.map((c) => c.id), [ordered]);
  const [_activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId((event.active.id as number) ?? null);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((c) => c.id === active.id);
    const newIndex = ordered.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    saveOrder(next);
  };

  // 정렬 저장 뮤테이션
  const { mutate: saveOrder, isPending: isSavingOrder } = useMutation({
    mutationFn: async (nextOrder: CategoryRow[]) => {
      const orderings = nextOrder.map((c, idx) => ({
        id: c.id,
        sortOrder: idx,
      }));
      await clientHttp.post<{ response: CategoryRow[] }>(
        "/api/categories/reorder",
        {
          json: { orderings },
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("정렬을 저장했습니다.");
    },
    onError: () => {
      toast.error("정렬 저장에 실패했습니다. 다시 시도해 주세요.");
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ordered.map((item) => (
              <SortableCard key={item.id} id={item.id}>
                <AdminCategoryItem
                  item={item}
                  isPending={isDeleting || isSavingOrder}
                  onDelete={async (id) => {
                    await deleteAsync(id);
                  }}
                />
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default AdminCategoryList;
