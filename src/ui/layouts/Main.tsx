import { cn } from "@ui/shadcn/lib/utils";
import type React from "react";

interface MainPropsextends
  extends Omit<React.ComponentPropsWithoutRef<"main">, "className"> {
  className?: string;
}
/** main 태그를 얇게 래핑한 컴포넌트 */
const Main = ({ className, ...rest }: MainPropsextends) => {
  return <main className={cn("app-layout app-main", className)} {...rest} />;
};

export default Main;
