"use client";

import { useDialogs } from "@shared/lib/react-layered-dialog/dialogs";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import CreateCategoryModal from "./CreateCategoryModal";

const CreateCategoryButton = () => {
  const { openDialog } = useDialogs();
  return (
    <Button
      size={"sm"}
      onClick={() => openDialog("modal", { children: <CreateCategoryModal /> })}
    >
      <Icon name="FilePlus" /> 카테고리 생성하기
    </Button>
  );
};

export default CreateCategoryButton;
