"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { deletePostAction, updatePostAction } from "@features/posts/actions";
import type { PostRow, UpdatePostInput } from "@features/posts/schemas";
import { dialog } from "@shared/lib/react-layered-dialog/dialogs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@ui/components/lucide-icons/Icon";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ui/shadcn/components";
import { Spinner } from "@ui/shadcn/components/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Editor from "../../../create/_components/Editor.client";

type EditPostFormProps = {
  categories: CategoryRow[];
  post: PostRow;
};

const EditPostForm = ({ categories, post }: EditPostFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    String(post.categoryId),
  );
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [description, setDescription] = useState(post.description ?? "");
  const [keywords, setKeywords] = useState<string[]>(post.keywords ?? []);
  const [contentJson, setContentJson] = useState<string>(post.content ?? "");
  const [isPublished, setIsPublished] = useState<boolean>(post.isPublished);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    post.thumbnailUrl ?? "",
  );

  const { mutateAsync: deletePostAsync, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePostAction(post.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("게시글을 삭제했습니다.");
      router.push("/admin/post");
      router.refresh();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      ),
  });

  const { mutateAsync: updatePostAsync, isPending: isSaving } = useMutation({
    mutationFn: (payload: UpdatePostInput) => updatePostAction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(
        isPublished ? "발행 상태로 저장되었습니다." : "수정되었습니다.",
      );
      router.push(`/admin/post/${post.id}`);
      router.refresh();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.",
      ),
  });

  const handleSubmit = async () => {
    if (isSaving) return;
    const updatePayload: UpdatePostInput = {
      id: post.id,
      title: title.trim(),
      slug: slug.trim(),
      categoryId: Number.parseInt(selectedCategoryId, 10),
      description: description.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      content: contentJson || undefined,
      isPublished,
    };
    await updatePostAsync(updatePayload);
  };

  const handleDeletClick = () => {
    dialog.confirm({
      title: "게시글 삭제",
      message: "정말로 이 게시글을 삭제하시겠습니까?",
      onConfirm: () => {
        void deletePostAsync();
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[720px] mx-auto">
      <div className="flex items-center justify-between">
        <Link href={`/admin/post/${post.id}`}>
          <Button variant="outline">
            <Icon name="ArrowLeft" /> 뒤로
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDeletClick}
          >
            {isDeleting ? (
              <Spinner className="size-4" />
            ) : (
              <Icon name="Trash2" />
            )}{" "}
            삭제
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSaving}>
            {isSaving ? <Spinner className="size-4" /> : <Icon name="Save" />}{" "}
            저장
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>카테고리</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>제목</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <Label>설명</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>썸네일 URL</Label>
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={(checked) => setIsPublished(!!checked)}
          />
          <Label htmlFor="isPublished">발행 여부</Label>
        </div>

        <div className="flex flex-col gap-2">
          <Label>본문</Label>
          <Editor initialContentJson={post.content} onChange={setContentJson} />
        </div>
      </section>
    </div>
  );
};

export default EditPostForm;
