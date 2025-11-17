"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { ApiClientError, clientHttp } from "@shared/lib/api/http-client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import {
  Button,
  Input,
  Spinner,
  Switch,
  Textarea,
  Label,
} from "@ui/shadcn/components";
import {
  categoryRowSchema,
  type CategoryRow,
  type UpdateCategoryInput,
} from "@features/categories/schemas";
import SkeletonUpdateCategoryModal from "./UpdateCategoryModal.skeleton";
import ModalContainer from "@ui/components/dialogs/ModalContainer";
import { useDialogController } from "react-layered-dialog";
import { toast } from "sonner";

const categoryDetailResponseSchema = z.object({
  data: categoryRowSchema,
  requestId: z.string().optional(),
  traceId: z.string().optional(),
});

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
      const result = await clientHttp.get<{
        response: CategoryRow;
      }>(`/api/categories/${categoryId}`, {
        schema: categoryDetailResponseSchema,
      });

      return categoryRowSchema.parse(result.data);
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
    mutationFn: (payload: UpdateCategoryInput) =>
      clientHttp.put<{ request: UpdateCategoryInput; response: CategoryRow }>(
        `/api/categories/${category.id}`,
        { body: payload },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({
          queryKey: ["category", category.id],
        }),
      ]);

      close();
      toast.success("카테고리 수정에 성공했습니다.");
    },
  });

  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const name = (value.name ?? category.name).trim();
      const slug = (value.slug ?? category.slug).trim();
      const description = value.description?.trim();
      const isVisible =
        typeof value.isVisible === "boolean"
          ? value.isVisible
          : category.isVisible;

      if (!name) {
        throw new Error("카테고리명을 입력하세요.");
      }

      if (!slug) {
        throw new Error("슬러그를 입력하세요.");
      }

      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(slug)) {
        throw new Error("슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다.");
      }

      const payload: UpdateCategoryInput = {
        id: category.id,
        name,
        slug,
        description: description || undefined,
        isVisible,
      };

      await mutation.mutateAsync(payload);
    },
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  return (
    <form
      className="flex flex-col gap-4 pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            value?.trim().length === 0 ? "카테고리명을 입력하세요." : undefined,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">name</Label>
            </div>
            <Input
              autoFocus
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="slug"
        validators={{
          onChange: ({ value }) => {
            const trimmed = value?.trim();
            if (!trimmed) return "슬러그를 입력하세요.";
            return /^[a-z0-9-]+$/.test(trimmed)
              ? undefined
              : "슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다.";
          },
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">slug</Label>
            </div>
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">description</Label>
            <Textarea
              placeholder="선택 입력"
              value={field.state.value ?? ""}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field
        name="isVisible"
        validators={{
          onChange: ({ value }) =>
            typeof value !== "boolean" ? "노출 여부를 선택하세요." : undefined,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">isVisible</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isVisible"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                onBlur={field.handleBlur}
              />
              <Label htmlFor="isVisible">
                {field.state.value ? "공개" : "비공개"}
              </Label>
            </div>
            {field.state.meta.errors?.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {mutation.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof ApiClientError
            ? mutation.error.message
            : mutation.error instanceof Error
              ? mutation.error.message
              : "카테고리 수정 중 오류가 발생했습니다."}
        </div>
      )}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            size="lg"
            className="w-full"
            type="submit"
            disabled={isSubmitting || mutation.isPending}
          >
            {(isSubmitting || mutation.isPending) && (
              <Spinner className="size-4" />
            )}
            수정하기
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default UpdateCategoryModal;
