"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { createPostAction } from "@features/posts/actions";
import type { CreatePostInput } from "@features/posts/schemas";
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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Editor from "./Editor.client";

type CreatePostFormProps = {
  /** 서버에서 전달된 카테고리 목록(정렬 순서 포함) */
  categories: CategoryRow[];
};

/**
 * @description 게시글 생성 폼 컴포넌트입니다.
 */
const CreatePostForm = ({ categories }: CreatePostFormProps) => {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [contentJson, setContentJson] = useState<string>("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(
    undefined,
  );

  const slugifyFromTitle = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleChangeDescription: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    const nextValue = event.target.value.slice(0, 200);
    setDescription(nextValue);
  };

  const handleKeywordKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const raw = keywordInput.trim();
    if (!raw) return;
    if (keywords.includes(raw)) {
      toast.error("이미 추가된 키워드입니다.");
      return;
    }
    if (keywords.length >= 5) {
      toast.error("키워드는 최대 5개까지 입력할 수 있습니다.");
      return;
    }
    setKeywords((prev) => [...prev, raw]);
    setKeywordInput("");
  };

  const handleRemoveKeyword = (value: string) => {
    setKeywords((prev) => prev.filter((keyword) => keyword !== value));
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const normalizedDescription = description.trim();
    const keywordValues = keywords
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    const categoryIdNum = Number.parseInt(selectedCategoryId, 10);
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();

    if (!categoryIdNum || Number.isNaN(categoryIdNum)) {
      toast.error("카테고리를 선택하세요.");
      return;
    }
    if (!trimmedTitle) {
      toast.error("제목을 입력하세요.");
      return;
    }
    if (!trimmedSlug) {
      toast.error("슬러그를 입력하세요.");
      return;
    }

    const payload: CreatePostInput = {
      title: trimmedTitle,
      slug: trimmedSlug,
      categoryId: categoryIdNum,
      description: normalizedDescription || undefined,
      keywords: keywordValues.length > 0 ? keywordValues : undefined,
      thumbnailUrl: thumbnailUrl?.trim() || undefined,
      content: contentJson || undefined,
      isPublished,
    };

    try {
      setIsSaving(true);
      const result = await createPostAction(payload);
      toast.success(
        isPublished ? "게시글을 발행했습니다." : "게시글을 저장했습니다.",
      );
      router.push(`/admin/post/${result.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full max-w-[720px] mx-auto">
      <div className="flex w-full justify-between">
        <div className="flex gap-2">
          <Link href="/admin/post">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={() => void handleSubmit()}
          >
            <Icon name="BookOpenCheck" /> 발행
          </Button>
        </div>
      </div>

      <section className="w-full flex flex-col gap-6">
        <div className="flex flex-col pb-4 border-b">
          <span className="text-[#f96859] font-medium">Step 01</span>
          <span className="text-base font-semibold">글 메타정보 작성</span>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">카테고리</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(
                (c) =>
                  c.isVisible && (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">제목</Label>
          <Input
            placeholder="글 제목을 입력하세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">슬러그</Label>
          <Input
            placeholder="예: my-first-post"
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            onFocus={() => {
              if (!slug && title.trim())
                setSlug(slugifyFromTitle(title.trim()));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">설명 (최대 200자)</Label>
          <Textarea
            value={description}
            onChange={handleChangeDescription}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">썸네일 URL</Label>
          <Input
            value={thumbnailUrl ?? ""}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
          {thumbnailUrl && (
            <div className="mt-2 border rounded p-2 flex justify-center bg-muted/20">
              <Image
                src={thumbnailUrl}
                alt="preview"
                width={400}
                height={200}
                className="max-h-[200px] w-auto object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="isPublished">
            {isPublished ? "공개" : "비공개(초안)"}
          </Label>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">키워드 (최대 5개)</Label>
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value.replace(/,/g, ""))}
            onKeyDown={handleKeywordKeyDown}
          />
          <div className="flex flex-wrap gap-1">
            {keywords.map((k) => (
              <div
                key={k}
                className="bg-accent px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {k}{" "}
                <button type="button" onClick={() => handleRemoveKeyword(k)}>
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full flex flex-col gap-6">
        <div className="flex flex-col pb-4 border-b">
          <span className="text-[#f96859] font-medium">Step 02</span>
          <span className="text-base font-semibold">글 작성하기</span>
        </div>
        <Editor onChange={setContentJson} />
      </section>
    </div>
  );
};

export default CreatePostForm;
