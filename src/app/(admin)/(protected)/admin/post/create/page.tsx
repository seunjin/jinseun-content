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
import Editor from "./Editor.client";

const AdminCreatePostPage = () => {
  return (
    <AppContainer>
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Icon name="ArrowLeft" />
        </Button>
        <Button variant="outline" size="icon">
          <Icon name="Save" />
        </Button>
        <Button variant="outline" size="icon">
          <Icon name="BookOpenCheck" />
        </Button>
      </div>
      <div className="flex gap-6">
        {/* 글 작성하기 */}
        <section className="w-3/4 h-full flex flex-col gap-6">
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 01</span>
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
        {/* 카테고리 및 썸네일 등록*/}
        <section className="w-1/4 flex flex-col gap-6 shrink-0">
          <div className="flex flex-col pb-4 border-b">
            <span className="text-[#f96859] font-medium">Step 02</span>
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
            <div className="aspect-video" />
            <Button variant="default">
              <Icon name="ImageOff" /> 썸네일 제거
            </Button>
          </div>
        </section>
      </div>
    </AppContainer>
  );
};

export default AdminCreatePostPage;
