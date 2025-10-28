import { CONTENT_CATEGORY_SELECT_OPTIONS } from "@shared/constants/category.constants";
import Icon from "@ui/components/lucide-icons/Icon";
import Main from "@ui/layouts/Main";
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
import Editor from "./Editor.client";

const AdminCreatePostPage = () => {
  return (
    <Main>
      <PageTopToolbar
        leftSideComponents={
          <Link href="/admin/post">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        }
        rightSideComponents={
          <>
            <Button variant="secondary" size="sm">
              <Icon name="Save" /> 저장
            </Button>
            <Button variant="default" size="sm">
              <Icon name="BookOpenCheck" /> 발행
            </Button>
          </>
        }
      />
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
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>카테고리(주제)</SelectLabel>
                  {CONTENT_CATEGORY_SELECT_OPTIONS.map((option) => {
                    return (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    );
                  })}
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
    </Main>
  );
};

export default AdminCreatePostPage;
