import React from "react";

import { ICON_PALETTE } from "./icons-palette";
function Icon({ name }: { name: keyof typeof ICON_PALETTE }) {
  const IconComponent = ICON_PALETTE[name];
  return <IconComponent />;
}

export default Icon;
