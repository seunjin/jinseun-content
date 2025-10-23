"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@ui/shadcn/lib/utils";
import type * as React from "react";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        " shrink-0",
        // 수평
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        // 수직 //data-[orientation=vertical]:h-full 제거
        "data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
