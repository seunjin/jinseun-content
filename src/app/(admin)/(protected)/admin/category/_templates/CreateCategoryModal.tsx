"use client";

import type {
  CategoryRow,
  CreateCategoryInput,
} from "@features/categories/schemas";
import { ApiClientError, clientHttp } from "@shared/lib/api/http-client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ModalContainer from "@ui/components/dialogs/ModalContainer";
import Icon from "@ui/components/lucide-icons/Icon";
import {
  Button,
  Input,
  Spinner,
  Switch,
  Label,
  Textarea,
} from "@ui/shadcn/components";
import { useDialogController } from "react-layered-dialog";
import { toast } from "sonner";

const CreateCategoryModal = () => {
  const { close, setStatus } = useDialogController();
  const queryClient = useQueryClient();

  const initialValues: CreateCategoryInput = {
    name: "",
    slug: "",
    description: undefined,
    isVisible: true,
  };

  const mutation = useMutation({
    mutationFn: (payload: CreateCategoryInput) =>
      clientHttp.post<{ request: CreateCategoryInput; response: CategoryRow }>(
        "/api/categories",
        { body: payload },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리 생성에 성공했습니다.");
    },
  });

  // onSubmit 안에서 mutateAsync 호출

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const payload: CreateCategoryInput = {
        ...value,
        name: value.name.trim(),
        slug: value.slug.trim(),
        description: value.description?.trim() || undefined,
        isVisible: value.isVisible,
      };

      if (!payload.name) {
        throw new Error("카테고리명을 입력하세요.");
      }

      if (!payload.slug) {
        throw new Error("슬러그를 입력하세요.");
      }

      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(payload.slug)) {
        throw new Error("슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다.");
      }
      await mutation.mutateAsync(payload);
      close();
    },
  });

  return (
    <ModalContainer>
      <div className="flex justify-between items-center pb-6 ">
        <span className="text-lg font-semibold">카테고리 생성하기</span>
        <Button variant="ghost" size="icon-sm" onClick={close}>
          <Icon name="X" />
        </Button>
      </div>

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
              value.trim().length === 0
                ? "카테고리명을 입력하세요."
                : undefined,
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
              const trimmed = value.trim();
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
              typeof value !== "boolean"
                ? "노출 여부를 선택하세요."
                : undefined,
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
                : "카테고리 생성 중 오류가 발생했습니다."}
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
              {(isSubmitting || mutation.isPending) && <Spinner />}
              생성하기
            </Button>
          )}
        </form.Subscribe>
      </form>
    </ModalContainer>
  );
};

export default CreateCategoryModal;
