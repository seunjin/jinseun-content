"use client";

import type {
  CategoryRow,
  CreateCategoryInput,
} from "@features/categories/schemas";
import { Label } from "@radix-ui/react-label";
import { ApiClientError, createHttpClient } from "@shared/lib/api/http-client";
import { useDialogs } from "@shared/lib/react-layered-dialog/dialogs";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button, Input, Spinner, Switch } from "@ui/shadcn/components";
import { motion } from "motion/react";
import { useState } from "react";

const httpClient = createHttpClient();

const CreateCategoryModal = () => {
  const { closeDialog } = useDialogs();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues: CreateCategoryInput = {
    name: "",
    slug: "",
    description: undefined,
    isVisible: true,
  };

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null);

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

        await httpClient.post<{
          request: CreateCategoryInput;
          response: CategoryRow;
        }>("/api/categories", {
          body: payload,
        });

        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        closeDialog();
      } catch (error) {
        if (error instanceof ApiClientError) {
          setSubmitError(error.message);
          return;
        }

        setSubmitError(
          error instanceof Error
            ? error.message
            : "카테고리 생성 중 오류가 발생했습니다.",
        );
      }
    },
  });

  return (
    <motion.div
      className="bg-background border rounded-md px-4 py-4 w-[min(100%,360px)]"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
    >
      <div className="flex justify-between items-center pb-6">
        <span className="text-lg font-semibold">카테고리 생성하기</span>
        <Button variant="ghost" size="icon-sm" onClick={() => closeDialog()}>
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
              {field.state.meta.errors?.length ? (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
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
              {field.state.meta.errors?.length ? (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">description</Label>
              <Input
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
              {field.state.meta.errors?.length ? (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        {submitError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              size="lg"
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              생성하기
            </Button>
          )}
        </form.Subscribe>
      </form>
    </motion.div>
  );
};

export default CreateCategoryModal;
