"use client";

import { useSidebar } from "@stores/useSidebar.mobile";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";

const AsideCloseButton = () => {
  const { sidebarClose } = useSidebar();
  return (
    <Button variant={`ghost`} size={"icon-sm"} onClick={sidebarClose}>
      <Icon name="X" />
    </Button>
  );
};

export default AsideCloseButton;
