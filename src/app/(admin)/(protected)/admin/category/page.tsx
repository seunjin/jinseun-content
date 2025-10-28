import Icon from "@ui/components/lucide-icons/Icon";
import Main from "@ui/layouts/Main";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";
import Link from "next/link";
import CreateCategoryButton from "./_components/CreateCategoryButton";

const CATEGORY = [
  {
    id: 0,
    categoryName: "React",
  },
  {
    id: 1,
    categoryName: "CSS",
  },
  {
    id: 2,
    categoryName: "Supabase",
  },
  {
    id: 3,
    categoryName: "CSS",
  },
];
const AdminCategoryPage = () => {
  return (
    <Main>
      <PageTopToolbar
        leftSideComponents={
          <Link href="/admin">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        }
        rightSideComponents={
          // 카테고리 생성하기 버튼
          <CreateCategoryButton />
        }
      />

      <div className="flex items-center gap-2 mb-8">
        <span className="text-lg font-semibold">카테고리 관리</span>
      </div>
      <div className="flex gap-4">
        {CATEGORY.map((item) => {
          return (
            <button
              type="button"
              key={item.id}
              className="border p-4 bg-foreground text-primary-foreground rounded-lg"
            >
              {item.categoryName}
            </button>
          );
        })}
      </div>
    </Main>
  );
};

export default AdminCategoryPage;
