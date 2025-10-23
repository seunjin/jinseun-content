import AppContainer from "@ui/layouts/AppContainer";
import { HotTopic } from "@ui/templates/hot-topic";
import { NewTopic } from "@ui/templates/new-topic";
import Image from "next/image";

const PubliRootPage = () => {
  return (
    <AppContainer withSidebar>
      {/* 토픽 콘텐츠 */}
      <div className="flex flex-col gap-12">
        {/* 핫 토픽 */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-conter gap-2">
              <Image
                src="/assets/gif/gif-001.gif"
                alt="@fire logo"
                width={24}
                height={24}
              />

              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                HOT 토픽
              </h4>
            </div>
            <p className="text-muted-foreground text-base md:text-sm">
              지금 가장 주목받는 주제들을 살펴보고, 다양한 관점의 인사이트를
              얻어보세요
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <HotTopic.Skeleton />
            <HotTopic.Skeleton />
            <HotTopic.Skeleton />
            <HotTopic.Skeleton />
          </div>
        </section>
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
            <NewTopic.Skeleton />
          </div>
        </section>
      </div>
    </AppContainer>
  );
};

export default PubliRootPage;
