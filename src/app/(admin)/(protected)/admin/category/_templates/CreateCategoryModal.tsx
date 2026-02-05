"use client";

import { createCategoryAction } from "@features/categories/actions";
import type { CreateCategoryInput } from "@features/categories/schemas";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useDialogController } from "react-layered-dialog";
import { toast } from "sonner";

const CreateCategoryModal = () => {
  const { close } = useDialogController();
  const queryClient = useQueryClient();

  const initialValues: CreateCategoryInput = {
    name: "",
    slug: "",
    description: undefined,
    isVisible: true,
  };

  const mutation = useMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategoryAction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리 생성에 성공했습니다.");
      close();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "카테고리 생성 중 오류가 발생했습니다.",
      );
    },
  });

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const payload: CreateCategoryInput = {
        ...value,
        name: value.name.trim(),
        slug: value.slug.trim(),
        description: value.description?.trim() || undefined,
      };

      if (!payload.name) {
        toast.error("카테고리명을 입력하세요.");
        return;
      }
      if (!payload.slug) {
        toast.error("슬러그를 입력하세요.");
        return;
      }

      await mutation.mutateAsync(payload);
    },
  });

  return (
    <ModalContainer>
      <div className="flex justify-between items-center pb-6">
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
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <Icon name="Asterisk" size={14} className="text-[#f96859]" />
                <Label className="text-muted-foreground">Name</Label>
              </div>
              <Input
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <Icon name="Asterisk" size={14} className="text-[#f96859]" />
                <Label className="text-muted-foreground">Slug</Label>
              </div>
              <Input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Description</Label>
              <Textarea
                placeholder="선택 입력"
                value={field.state.value ?? ""}
                onChange={(event) => field.handleChange(event.target.value)}
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
                  id="isVisible"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <Label htmlFor="isVisible">
                  {field.state.value ? "공개" : "비공개"}
                </Label>
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
          {mutation.isPending && <Spinner />}
          생성하기
        </Button>
      </form>
    </ModalContainer>
  );
};

export default CreateCategoryModal;
