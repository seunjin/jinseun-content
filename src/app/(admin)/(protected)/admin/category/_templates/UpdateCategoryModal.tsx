"use client";

import { updateCategoryAction } from "@features/categories/actions";
import {
  type CategoryRow,
  categoryRowSchema,
  type UpdateCategoryInput,
} from "@features/categories/schemas";
import { createClient } from "@lib/supabase/client.supabase";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ModalContainer from "@ui/components/dialogs/ModalContainer";
import Icon from "@ui/components/lucide-icons/Icon";
import {
  Button,
  Input,
  Label,
  Spinner,
  Switch,
  Textarea,
} from "@ui/shadcn/components";
import { useEffect, useMemo } from "react";
import { useDialogController } from "react-layered-dialog";
import { toast } from "sonner";
import SkeletonUpdateCategoryModal from "./UpdateCategoryModal.skeleton";

type UpdateCategoryModalProps = {
  categoryId: number;
};

const UpdateCategoryModal = ({ categoryId }: UpdateCategoryModalProps) => {
  const { close } = useDialogController();

  const {
    data: category,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<CategoryRow, Error>({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select(
          "id, name, slug, description, sortOrder:sort_order, isVisible:is_visible, createdAt:created_at, updatedAt:updated_at",
        )
        .eq("id", categoryId)
        .single();

      if (error) throw new Error(error.message);
      return categoryRowSchema.parse(data);
    },
    staleTime: 1000 * 30,
  });

  return (
    <ModalContainer>
      <div className="flex justify-between items-center pb-6">
        <span className="text-lg font-semibold">카테고리 수정하기</span>
        <Button variant="ghost" size="icon-sm" onClick={close}>
          <Icon name="X" />
        </Button>
      </div>
      {isLoading ? (
        <SkeletonUpdateCategoryModal />
      ) : isError || !category ? (
        <div className="flex flex-col items-center gap-4 border rounded-lg p-6 text-center">
          <div className="text-destructive">
            {error?.message ?? "카테고리를 불러오는 중 오류가 발생했습니다."}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <UpdateCategoryForm category={category} />
      )}
    </ModalContainer>
  );
};

type UpdateCategoryFormProps = {
  category: CategoryRow;
};

const UpdateCategoryForm = ({ category }: UpdateCategoryFormProps) => {
  const { close } = useDialogController();
  const queryClient = useQueryClient();

  const defaults = useMemo<UpdateCategoryInput>(
    () => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      isVisible: category.isVisible,
    }),
    [category],
  );

  const mutation = useMutation({
    mutationFn: (payload: UpdateCategoryInput) => updateCategoryAction(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["category", category.id] }),
      ]);
      close();
      toast.success("카테고리 수정에 성공했습니다.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "수정 중 오류가 발생했습니다.",
      );
    },
  });

  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const payload: UpdateCategoryInput = {
        ...value,
        id: category.id,
        name: (value.name ?? "").trim(),
        slug: (value.slug ?? "").trim(),
        description: value.description?.trim() || undefined,
      };

      if (!payload.name) toast.error("카테고리명을 입력하세요.");
      else if (!payload.slug) toast.error("슬러그를 입력하세요.");
      else await mutation.mutateAsync(payload);
    },
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  return (
    <form
      className="flex flex-col gap-4 pb-6"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Name</Label>
            <Input
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="slug">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Slug</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="isVisible">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Visibility</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <Label>{field.state.value ? "공개" : "비공개"}</Label>
            </div>
          </div>
        )}
      </form.Field>

      <Button
        size="lg"
        className="w-full"
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <Spinner className="size-4" />} 수정하기
      </Button>
    </form>
  );
};

export default UpdateCategoryModal;
