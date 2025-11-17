"use client";

import { dialog } from "@shared/lib/react-layered-dialog/dialogs";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";
import CreateCategoryModal from "../_templates/CreateCategoryModal";

const CreateCategoryButton = () => {
  return (
    <Button
      size={"sm"}
      onClick={() => dialog.modal({ children: <CreateCategoryModal /> })}
    >
      <Icon name="FilePlus" /> 카테고리 생성하기
    </Button>
  );
};

export default CreateCategoryButton;
