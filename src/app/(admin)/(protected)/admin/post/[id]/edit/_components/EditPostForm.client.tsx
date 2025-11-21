"use client";

import type { CategoryRow } from "@features/categories/schemas";
import type { PostRow, UpdatePostInput } from "@features/posts/schemas";
import { ApiClientError, clientHttp } from "@shared/lib/api/http-client";
import Icon from "@ui/components/lucide-icons/Icon";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Editor from "../../../create/_components/Editor.client";

type KeywordField = {
  /** 키워드 입력 필드 고유 ID (리스트 key용) */
  id: string;
  /** 입력된 키워드 값 */
  value: string;
};

let keywordIdSeed = 0;

/**
 * @description 신규 키워드 입력 필드를 생성합니다.
 */
const createKeywordField = (value = ""): KeywordField => ({
  id: `kw-${keywordIdSeed++}`,
  value,
});

type EditPostFormProps = {
  /** 서버에서 전달된 카테고리 목록(정렬 순서 포함) */
  categories: CategoryRow[];
  /** 수정 대상 게시글 데이터 */
  post: PostRow;
};

/**
 * @description 게시글 수정 폼 컴포넌트입니다.
 * - 기존 게시글 데이터를 초기값으로 사용해 제목, 설명, 키워드, 본문(BlockNote)을 수정합니다.
 * - "저장" 클릭 시 현재 발행 상태를 유지하고, "발행" 클릭 시 isPublished=true로 업데이트합니다.
 */
const EditPostForm = ({ categories, post }: EditPostFormProps) => {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    String(post.categoryId),
  );
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [description, setDescription] = useState(post.description ?? "");
  const [keywords, setKeywords] = useState<KeywordField[]>(() => {
    if (post.keywords && post.keywords.length > 0) {
      return post.keywords.map((kw) => createKeywordField(kw));
    }
    return [createKeywordField()];
  });
  /**
   * @description BlockNote 에디터의 문서 JSON을 문자열로 직렬화한 값입니다.
   * - 초기값은 기존 게시글의 content를 그대로 사용합니다.
   */
  const [contentJson, setContentJson] = useState<string>(post.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * @description 제목을 기반으로 슬러그를 생성합니다.
   * - 영문 소문자/숫자/하이픈만 허용하고, 연속 하이픈과 앞뒤 하이픈을 정리합니다.
   */
  const slugifyFromTitle = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  /** description 변경 핸들러 */
  const handleChangeDescription: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    const nextValue = event.target.value.slice(0, 200);
    setDescription(nextValue);
  };

  /** 키워드 단일 항목 값 변경 핸들러 */
  const handleChangeKeyword = (id: string, value: string) => {
    setKeywords((prev) =>
      prev.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  /** 키워드 필드 추가 (최대 5개) */
  const handleAddKeyword = () => {
    setKeywords((prev) => {
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, createKeywordField()];
    });
  };

  /** 키워드 필드 삭제 */
  const handleRemoveKeyword = (id: string) => {
    setKeywords((prev) => {
      if (prev.length === 1) {
        return [createKeywordField()];
      }
      return prev.filter((field) => field.id !== id);
    });
  };

  const handleSubmit = async (nextIsPublished: boolean) => {
    if (isSaving) return;

    const normalizedDescription = description.trim();
    const keywordValues = keywords
      .map((field) => field.value.trim())
      .filter((value) => value.length > 0);

    const categoryIdNum = Number.parseInt(selectedCategoryId, 10);
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();

    if (Number.isNaN(categoryIdNum)) {
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

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(trimmedSlug)) {
      toast.error("슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다.");
      return;
    }

    const payload: UpdatePostInput = {
      id: post.id,
      title: trimmedTitle,
      slug: trimmedSlug,
      categoryId: categoryIdNum,
      description: normalizedDescription || undefined,
      keywords: keywordValues.length > 0 ? keywordValues : undefined,
      // 썸네일 업로드 기능은 아직 없으므로 기존 값을 유지합니다.
      thumbnailUrl: post.thumbnailUrl ?? undefined,
      // BlockNote 문서 JSON 문자열(없으면 undefined로 처리)
      content: contentJson || undefined,
      isPublished: nextIsPublished,
    };

    try {
      setIsSaving(true);
      await clientHttp.put<{ request: UpdatePostInput; response: unknown }>(
        `/api/posts/${post.id}`,
        {
          body: payload,
        },
      );

      toast.success(
        nextIsPublished
          ? "게시글을 발행 상태로 저장했습니다."
          : "게시글을 수정했습니다.",
      );
      // 수정 후 상세 페이지로 이동합니다.
      router.push(`/admin/post/${post.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("게시글 수정 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 툴바 */}
      <PageTopToolbar>
        <div className="flex gap-2">
          <Link href={`/admin/post/${post.id}`}>
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={() => {
              void handleSubmit(post.isPublished);
            }}
          >
            <Icon name="Save" /> 저장
          </Button>
          <Button
            variant="default"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={() => {
              void handleSubmit(true);
            }}
          >
            <Icon name="BookOpenCheck" /> 발행
          </Button>
        </div>
      </PageTopToolbar>

      <div
        className={cn(
          "flex flex-col items-start gap-6",
          // 반응형 스타일
          "lg:flex-row",
        )}
      >
        {/* 카테고리 및 썸네일 등록 */}
        <section
          className={cn(
            "relative",
            "w-full flex flex-col gap-6 shrink-0",
            // 반응형 스타일
            "lg:sticky lg:top-[calc(var(--header-height)*2+1.5rem)] lg:w-[320px]",
          )}
        >
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 01</span>
            <span className="text-base font-semibold">
              카테고리 및 썸네일 수정
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">카테고리</Label>
            </div>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setSelectedCategoryId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>카테고리(주제)</SelectLabel>
                  {categories.map(
                    (category) =>
                      category.isVisible && (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-muted-foreground">썸네일 (선택)</Label>
            </div>
            <div className="aspect-video rounded-md bg-accent" />
            <Button variant="default" type="button" disabled>
              <Icon name="ImageOff" /> 썸네일 기능 준비 중
            </Button>
          </div>
        </section>

        {/* 글 수정하기 */}
        <div className="w-full">
          <section
            className={cn(
              "w-full h-full flex flex-col gap-6",
              // 반응형 스타일
              "lg:flex-1",
            )}
          >
            <div className="flex flex-col pb-4 border-b">
              <span className="text-[#f96859] font-medium">Step 02</span>
              <span className="text-base font-semibold">글 수정하기</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Icon name="Asterisk" size={14} className="text-[#f96859]" />
                <Label className="text-muted-foreground">제목</Label>
              </div>
              <Input
                placeholder="글 제목을 입력하세요."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            {/* 슬러그 (필수 입력) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Icon name="Asterisk" size={14} className="text-[#f96859]" />
                <Label className="text-muted-foreground">슬러그</Label>
              </div>
              <Input
                placeholder="예: my-first-post"
                value={slug}
                onFocus={() => {
                  if (!slug && title.trim()) {
                    const nextSlug = slugifyFromTitle(title.trim());
                    if (nextSlug) {
                      setSlug(nextSlug);
                    }
                  }
                }}
                onChange={(event) => {
                  const raw = event.target.value;
                  const normalized = raw
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/-+/g, "-");
                  setSlug(normalized);
                }}
              />
            </div>

            {/* 설명/키워드 (선택 입력) */}
            <div className="flex flex-col gap-6">
              {/* 설명 입력 (옵션) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Label className="text-muted-foreground">
                    설명 (선택, 최대 200자)
                  </Label>
                </div>
                <Textarea
                  value={description}
                  maxLength={200}
                  onChange={handleChangeDescription}
                  placeholder="글 목록 카드에서 보여줄 간단한 요약을 입력하세요."
                  rows={4}
                />
                <p className="self-end text-xs text-muted-foreground">
                  {description.length} / 200
                </p>
              </div>

              {/* 키워드 입력 (옵션) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-muted-foreground">
                      키워드 (선택, 최대 5개)
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    목록 카드 하단에 #태그로 표기됩니다.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {keywords.map((field) => (
                    <div
                      key={field.id}
                      className={cn(
                        "flex items-center gap-2",
                        "group/keyword-row",
                      )}
                    >
                      <Input
                        value={field.value}
                        onChange={(event) =>
                          handleChangeKeyword(field.id, event.target.value)
                        }
                        placeholder="키워드를 입력하세요. 예: react, ui, nextjs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 text-muted-foreground"
                        onClick={() => handleRemoveKeyword(field.id)}
                        aria-label="키워드 제거"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-1"
                    onClick={handleAddKeyword}
                    disabled={keywords.length >= 5}
                  >
                    <Icon name="Plus" size={14} />
                    키워드 추가
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {keywords.length} / 5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Icon name="Asterisk" size={14} className="text-[#f96859]" />
                <Label className="text-muted-foreground">본문</Label>
              </div>
              {/* BlockNote Text Editor UI */}
              <Editor
                initialContentJson={post.content ?? undefined}
                onChange={(json) => {
                  setContentJson(json);
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default EditPostForm;
