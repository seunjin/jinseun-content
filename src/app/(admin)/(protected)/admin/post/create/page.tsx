import { fetchCategoriesServer } from "@features/categories/server";
import Icon from "@ui/components/lucide-icons/Icon";
import PageContainer from "@ui/layouts/PageContainer";
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
} from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";
import Editor from "./_components/Editor.client";

const AdminCreatePostPage = async () => {
  // 서버에서 카테고리 목록을 조회해 정렬 순서대로 옵션을 구성합니다.
  const categories = await fetchCategoriesServer();
  return (
    <PageContainer.Default>
      {/* 툴바 */}
      <PageTopToolbar>
        <div className="flex gap-2">
          <Link href="/admin/post">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Icon name="Save" /> 저장
          </Button>
          <Button variant="default" size="sm">
            <Icon name="BookOpenCheck" /> 발행
          </Button>
        </div>
      </PageTopToolbar>
      <div
        className={cn(
          "flex flex-col items-start gap-6",
          //반응형 스타일
          "lg:flex-row",
        )}
      >
        {/* 카테고리 및 썸네일 등록*/}
        <section
          className={cn(
            "relative",
            "w-full flex flex-col gap-6 shrink-0",
            //반응형 스타일
            "lg:sticky lg:top-[calc(var(--header-height)*2+1.5rem)] lg:w-[320px]",
          )}
        >
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 01</span>
            <span className="text-base font-semibold">
              카테고리 및 썸네일 등록
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">카테고리</Label>
            </div>
            <Select>
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
                          // aria-label 등 접근성 속성을 필요 시 추가할 수 있습니다.
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
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">썸네일</Label>
            </div>
            <div className="aspect-video rounded-md bg-accent" />
            <Button variant="default">
              <Icon name="ImageOff" /> 썸네일 제거
            </Button>
          </div>
        </section>
        {/* 글 작성하기 */}
        <section
          className={cn(
            "w-full h-full flex flex-col gap-6",
            // 반응형 스타일
            "lg:flex-1",
          )}
        >
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 02</span>
            <span className="text-base font-semibold">글 작성하기</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">제목</Label>
            </div>
            <Input placeholder="글 제목을 입력하세요." />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Icon name="Asterisk" size={14} className="text-[#f96859]" />
              <Label className="text-muted-foreground">본문</Label>
            </div>
            {/* BlockNote Text Editor UI */}
            <Editor />
          </div>
        </section>
      </div>
    </PageContainer.Default>
  );
};

export default AdminCreatePostPage;
