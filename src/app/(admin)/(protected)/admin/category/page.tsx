import Icon from "@ui/components/lucide-icons/Icon";
import Main from "@ui/layouts/Main";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";
import Link from "next/link";

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
          <Button size="sm">
            <Icon name="FilePlus" /> 카테고리 생성
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-8">
        <span className="text-lg font-semibold">카테고리 관리</span>
      </div>
      <div className="flex flex-col gap-4">
        {CATEGORY.map((item, index) => {
          return (
            <div key={item.id} className="border p-4 rounded-lg">
              {item.categoryName} {index + 1}
            </div>
          );
        })}
      </div>
    </Main>
  );
};

export default AdminCategoryPage;
