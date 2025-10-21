import React, { forwardRef } from "react";

import { ICON_PALETTE } from "./icons-palette";
import { LucideIcon, LucideProps } from "lucide-react";

export type IconName = keyof typeof ICON_PALETTE;

/**
 * Thin wrapper around lucide-react icons that lets you select by `name` while
 * preserving full LucideProps and the SVG ref.
 */
export interface IconProps extends LucideProps {
  name: IconName;
}
const Icon = forwardRef<SVGSVGElement, IconProps>(({ name, ...props }, ref) => {
  const IconComponent = ICON_PALETTE[name] as LucideIcon;
  return <IconComponent ref={ref} {...props} />;
});

Icon.displayName = "Icon";

export default Icon;
