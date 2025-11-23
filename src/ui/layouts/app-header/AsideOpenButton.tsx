"use client";

import { useSidebar } from "@stores/useSidebar.mobile";
import Icon from "@ui/components/lucide-icons/Icon";
import { Button } from "@ui/shadcn/components";

const AsideOpenButton = () => {
  const { sidebarOpen } = useSidebar();
  return (
    <Button variant={`ghost`} size={"icon-sm"} onClick={sidebarOpen}>
      <Icon name="Menu" />
    </Button>
  );
};

export default AsideOpenButton;
