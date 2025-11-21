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
  Switch,
  Textarea,
} from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Editor from "../../../create/_components/Editor.client";

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
  /**
   * @description 입력된 키워드 문자열 목록입니다.
   * - 기존 게시글에 저장된 키워드를 초기값으로 사용합니다.
   * - 과거 데이터 중 직렬화된 배열 문자열('["a","b"]') 또는 콤마 구분("a,b")이
   *   포함된 경우를 안전하게 분해해 정규화합니다.
   */
  const [keywords, setKeywords] = useState<string[]>(() => {
    if (!post.keywords || post.keywords.length === 0) {
      return [];
    }

    const normalized = post.keywords.flatMap((raw) => {
      const value = String(raw).trim();
      if (!value) return [];

      // JSON 배열 문자열 형태인 경우: '["react","ui"]'
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          const parsed = JSON.parse(value) as unknown;
          if (Array.isArray(parsed)) {
            return parsed
              .map((item) => String(item).trim())
              .filter((item) => item.length > 0);
          }
        } catch {
          // 파싱 실패 시에는 아래 일반 로직으로 처리합니다.
        }
      }

      // 콤마 구분 문자열인 경우: "react, ui, nextjs"
      return value
        .split(",")
        .map((piece) => piece.trim())
        .filter((piece) => piece.length > 0);
    });

    // 중복 제거
    return Array.from(new Set(normalized));
  });
  /**
   * @description 키워드 입력 인풋의 현재 값입니다.
   * - Enter 키 입력 시 keywords 배열에 추가됩니다.
   */
  const [keywordInput, setKeywordInput] = useState<string>("");
  /**
   * @description BlockNote 에디터의 문서 JSON을 문자열로 직렬화한 값입니다.
   * - 초기값은 기존 게시글의 content를 그대로 사용합니다.
   */
  const [contentJson, setContentJson] = useState<string>(post.content ?? "");
  /**
   * @description 게시글 발행 여부입니다.
   * - 스위치 컴포넌트로 공개/비공개를 전환합니다.
   */
  const [isPublished, setIsPublished] = useState<boolean>(post.isPublished);
  const [isSaving, setIsSaving] = useState(false);
  /**
   * @description 썸네일 이미지의 공개 URL입니다.
   * - Supabase Storage 등에 업로드한 이미지의 URL을 수동으로 입력합니다.
   */
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    post.thumbnailUrl ?? "",
  );

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

  /**
   * @description 키워드 인풋에서 Enter 키를 눌렀을 때 새 키워드를 추가합니다.
   * - 공백/중복 값은 무시합니다.
   * - 최대 5개까지만 추가할 수 있습니다.
   */
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

  /**
   * @description 개별 키워드를 제거합니다.
   */
  const handleRemoveKeyword = (value: string) => {
    setKeywords((prev) => prev.filter((keyword) => keyword !== value));
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const normalizedDescription = description.trim();
    const keywordValues = keywords
      .map((value) => value.trim())
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

    const trimmedThumbnailUrl = thumbnailUrl.trim();
    if (trimmedThumbnailUrl) {
      try {
        const parsed = new URL(trimmedThumbnailUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          toast.error("썸네일 URL은 http 또는 https 형식이어야 합니다.");
          return;
        }
      } catch {
        toast.error("썸네일 URL 형식이 올바르지 않습니다.");
        return;
      }
    }

    const payload: UpdatePostInput = {
      id: post.id,
      title: trimmedTitle,
      slug: trimmedSlug,
      categoryId: categoryIdNum,
      description: normalizedDescription || undefined,
      keywords: keywordValues.length > 0 ? keywordValues : undefined,
      // Supabase Storage 등에서 발급된 썸네일 공개 URL (선택)
      thumbnailUrl: trimmedThumbnailUrl || undefined,
      // BlockNote 문서 JSON 문자열(없으면 undefined로 처리)
      content: contentJson || undefined,
      isPublished,
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
        isPublished
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
            variant="default"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={() => {
              void handleSubmit();
            }}
          >
            <Icon name="Save" /> 수정
          </Button>
        </div>
      </PageTopToolbar>

      <div
        className={cn(
          "flex flex-col items-start gap-6",
          // 반응형 스타일
          // "lg:flex-row",
        )}
      >
        {/* 카테고리 및 썸네일 등록 */}
        <section
          className={cn(
            "relative",
            "w-full flex flex-col gap-6 shrink-0",
            // 반응형 스타일
            // "lg:sticky lg:top-[calc(var(--header-height)*2+1.5rem)] lg:w-[320px]",
          )}
        >
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 01</span>
            <span className="text-base font-semibold">글 메타정보 수정</span>
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
          {/* 제목 (필수 입력) */}
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
          {/* 썸네일 URL (선택) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-muted-foreground">썸네일 URL (선택)</Label>
            </div>
            <Input
              placeholder="https://... (Supabase Storage 이미지 URL)"
              value={thumbnailUrl}
              onChange={(event) => {
                setThumbnailUrl(event.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              카드에 표시할 대표 이미지 주소입니다. Supabase Storage에 업로드한
              이미지 URL을 붙여넣어 주세요.
            </p>
          </div>

          {/* 공개 여부 스위치 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-muted-foreground">공개 여부</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(!!checked)}
              />
              <Label htmlFor="isPublished">
                {isPublished ? "공개" : "비공개(초안)"}
              </Label>
            </div>
          </div>

          {/* 키워드 입력 (옵션) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-muted-foreground">
                키워드 (선택, 최대 5개)
              </Label>
            </div>

            <div className="flex flex-col gap-2">
              <Input
                value={keywordInput}
                onChange={(event) => {
                  const raw = event.target.value;
                  // 쉼표(,)는 키워드 구분자로 오해될 수 있으므로 입력 단계에서 제거합니다.
                  const sanitized = raw.replace(/,/g, "");
                  setKeywordInput(sanitized);
                }}
                onKeyDown={handleKeywordKeyDown}
                placeholder="키워드를 입력 후 Enter 키를 눌러 추가하세요. 예: react, ui, nextjs"
              />

              <div className="flex flex-wrap gap-2">
                {keywords.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    아직 추가된 키워드가 없습니다.
                  </span>
                ) : (
                  keywords.map((value) => (
                    <div
                      key={value}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <span>{value}</span>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full hover:bg-accent/60 transition-colors"
                        onClick={() => handleRemoveKeyword(value)}
                        aria-label={`${value} 키워드 제거`}
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 글 수정하기 */}
        <div className="w-full">
          <section
            className={cn(
              "w-full h-full flex flex-col gap-6",
              // 반응형 스타일
              // "lg:flex-1"
            )}
          >
            <div className="flex flex-col pb-4 border-b">
              <span className="text-[#f96859] font-medium">Step 02</span>
              <span className="text-base font-semibold">글 수정하기</span>
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
