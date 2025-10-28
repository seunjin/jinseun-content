"use client";
import { Label } from "@radix-ui/react-label";
import { useDialogs } from "@shared/lib/react-layered-dialog/dialogs";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button, Input, Switch } from "@ui/shadcn/components";
import { motion } from "motion/react";

const CreateCategoryModal = () => {
  const { closeDialog } = useDialogs();
  return (
    <motion.div
      className="bg-background border rounded-md px-4 py-4 w-[min(100%,360px)]"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
    >
      <div className="flex justify-between items-center pb-6">
        <span className="text-lg font-semibold">카테고리 생성하기</span>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          onClick={() => closeDialog()}
        >
          <Icon name="X" />
        </Button>
      </div>
      <div className="flex flex-col gap-4 pb-6">
        {/* 카테고리 명 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Icon name="Asterisk" size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">name</Label>
          </div>
          <Input autoFocus />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Icon name="Asterisk" size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">slug</Label>
          </div>
          <Input />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">description</Label>
          <Input />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Icon name="Asterisk" size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">isVisible</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isVisible" />
            <Label htmlFor="isVisible">공개 / 비공개</Label>
          </div>
        </div>
      </div>
      <div>
        <Button size={"lg"} className="w-full">
          생성하기
        </Button>
      </div>
    </motion.div>
  );
};

export default CreateCategoryModal;
