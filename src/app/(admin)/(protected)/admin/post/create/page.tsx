import { CONTENT_CATEGORY_SELECT_OPTIONS } from "@shared/constants/category.constants";
import Icon from "@ui/components/lucide-icons/Icon";
import AppContainer from "@ui/layouts/AppContainer";
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
    <>
      <div
        className={cn(
          "sticky top-[var(--header-height)] h-[var(--header-height)]  bg-background/10  backdrop-blur-md",
          "border-b border-border/50 dark:border-border",
        )}
      >
        <div
          className={cn(
            "app-layout app-header h-full",
            "flex items-center justify-between",
          )}
        >
          <div className="flex">
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
        </div>
      </div>
      <AppContainer>
        <div className="flex items-start gap-6">
          {/* 카테고리 및 썸네일 등록*/}
          <section
            className={cn(
              "sticky top-[calc(var(--header-height)*2+1.5rem)]",
              "w-[320px] flex flex-col gap-6 shrink-0",
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
          <section className="flex-1 h-full flex flex-col gap-6">
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
            <div className="bg-accent rounded-md h-900"></div>
          </section>
        </div>
      </AppContainer>
    </>
  );
};

export default AdminCreatePostPage;
