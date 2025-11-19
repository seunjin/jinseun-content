import { fetchCategoriesServer } from "@features/categories/server";
import Icon from "@ui/components/lucide-icons/Icon";
import PageContainer from "@ui/layouts/PageContainer";
import PageTopToolbar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";
import Link from "next/link";
import CreateCategoryButton from "./_components/CreateCategoryButton";
import AdminCategoryList from "./_templates/AdminCategoryList";

const AdminCategoryPage = async () => {
  const categories = await fetchCategoriesServer();

  return (
    <PageContainer.Default>
      <PageTopToolbar>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" size="icon-sm">
              <Icon name="ArrowLeft" />
            </Button>
          </Link>
        </div>
        <CreateCategoryButton />
      </PageTopToolbar>

      <div className="flex items-center gap-2 mb-8">
        <span className="text-lg font-semibold">카테고리 관리</span>
      </div>

      <AdminCategoryList initialCategories={categories} />
    </PageContainer.Default>
  );
};

export default AdminCategoryPage;
