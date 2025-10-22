import { cn } from "@shadcn/lib/utils";
import { Button, Separator } from "@shadcn/ui";
import Image from "next/image";

const AppFooter = () => {
  return (
    <footer className={cn("border-t border-border/50 dark:border-border")}>
      <div className={cn("app-layout app-footer")}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                나의 학습 여정이,
              </h3>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                나만의 창작으로 이어지는 플랫폼
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size={"icon"}>
                <Image src="/" alt="@SNS" className="size-6" />
              </Button>
              <Button variant="outline" size={"icon"}>
                <Image src="/" alt="@SNS" className="size-6" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cursor-pointer transition-[color] duration-300 text-primary/40 hover:text-primary"
            >
              이용약관
            </button>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <button
              type="button"
              className="cursor-pointer transition-[color] duration-300 text-primary/40 hover:text-primary"
            >
              개인정보처리방침
            </button>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <button
              type="button"
              className="cursor-pointer transition-[color] duration-300 text-primary/40 hover:text-primary"
            >
              클래스 론칭 문의
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
