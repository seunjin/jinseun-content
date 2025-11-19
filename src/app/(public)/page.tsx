import CategorySidebar from "@ui/layouts/app-sidebar/CategorySidebar";
import PageContainer from "@ui/layouts/PageContainer";
import { NewTopic } from "@ui/templates/new-topic";

const PubliRootPage = () => {
  return (
    <PageContainer.WithSidebar sidebarComponent={<CategorySidebar />}>
      <div className="flex flex-col gap-12">
        {/* NEW 토픽 */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-conter gap-2">
              <Image
                src="/assets/gif/gif-002.gif"
                alt="@fire logo"
                width={24}
                height={24}
              />

              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                NEW 토픽
              </h4>
            </div>
            <p className="text-muted-foreground text-base md:text-sm">
              새로운 시선으로, 새로운 이야기를 시작하세요. 지금 바로 당신만의
              토픽을 작성해보세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
            <NewTopic.Skeleton />
          </div>
        </section>
      </div>
      {/* --- 사이드 바 영역 --- */}

      {/* --- 메인 컨텐츠 영역 --- */}

      {/* 토픽 콘텐츠 */}
    </PageContainer.WithSidebar>
  );
};

export default PubliRootPage;
