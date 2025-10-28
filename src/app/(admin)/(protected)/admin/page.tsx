import { Separator } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Link from "next/link";

const AdminPage = () => {
  return (
    <main className={cn("app-layout app-main", "flex flex-col gap-6")}>
      <div>
        <div>
          <Link
            className="text-base hover:underline underline-offset-4"
            href="/admin/post"
          >
            main: 글 리스트
          </Link>
        </div>
        <ul className="pl-2">
          <li>
            <Link
              className="text-base hover:underline underline-offset-4"
              href="/admin/post/1"
            >
              sub: 글 상세
            </Link>
          </li>
          <li>
            <Link
              className="text-base hover:underline underline-offset-4"
              href="/admin/post/create"
            >
              sub: 글 작성하기
            </Link>
          </li>
        </ul>
      </div>
      <Separator orientation="horizontal" className="bg-accent" />
      <div>
        <div>
          <Link
            className="text-base hover:underline underline-offset-4"
            href="/admin/post"
          >
            main: 카테고리 리스트
          </Link>
        </div>
        <ul className="pl-2">
          <li>
            <Link
              className="text-base hover:underline underline-offset-4"
              href="#"
            >
              sub: 카테고리 상세
            </Link>
          </li>
          <li>
            <Link
              className="text-base hover:underline underline-offset-4"
              href="#"
            >
              sub: 카테고리 생성
            </Link>
          </li>
        </ul>
      </div>
      <Separator orientation="horizontal" className="bg-accent" />
      <div>
        <div>
          <Link
            className="text-base hover:underline underline-offset-4"
            href="/admin/post"
          >
            main: 프로필 관리
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminPage;
