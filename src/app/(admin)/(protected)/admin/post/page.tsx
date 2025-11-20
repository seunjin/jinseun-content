import type { PostSummary } from "@features/posts/types";
import PostCardGrid from "@ui/components/post/PostCardGrid";
import CategorySidebar from "@ui/layouts/app-sidebar/CategorySidebar";
import PageContainer from "@ui/layouts/PageContainer";
import PageTopToolBar from "@ui/layouts/PageTopToolbar";
import { Button } from "@ui/shadcn/components";

const AdminPostPage = () => {
  // TODO: 실제 API 연동 전까지 임시 목업 데이터
  const _items: PostSummary[] = [
    {
      id: 1,
      slug: "hello-world",
      title: "Hello World — 프로젝트 소개와 기본 원칙",
      description:
        "블로그 첫 글입니다. 프로젝트 방향과 기술 스택, 작업 원칙을 간단히 소개합니다.",
      keywords: ["intro", "guideline", "project"],
      categoryName: "일반",
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: null,
    },
    {
      id: 2,
      slug: "dnd-kit-reorder",
      title: "드래그 앤 드랍 정렬 UX 구현기 (dnd-kit)",
      description:
        "Next.js와 dnd-kit을 활용해 그리드형 정렬을 구현하고 저장까지 연결한 과정.",
      keywords: ["nextjs", "dnd-kit", "ui"],
      categoryName: "React",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      slug: "layout-patterns",
      title: "레이아웃 컴포넌트 설계와 조립 패턴",
      description: "PageContainer와 Toolbar의 책임 분리 및 옵션화 전략 정리.",
      keywords: ["layout", "component", "pattern"],
      categoryName: "UI",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      slug: "category-admin-ui",
      title: "카테고리 관리 UI와 모달 패턴",
      description: "Confirm/Alert/Modal 컴포넌트 설계와 접근성 고려사항.",
      keywords: ["admin", "modal", "category"],
      categoryName: "Admin",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      slug: "form-validation",
      title: "폼 검증과 입력 UI 설계 팁",
      description: "TanStack Form과 Zod를 활용한 폼 검증 패턴, UX 디테일 모음.",
      keywords: ["form", "validation", "ux"],
      categoryName: "Forms",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      slug: "server-client-boundaries",
      title: "서버 액션과 클라이언트 컴포넌트의 경계 — 언제 어디서 무엇을?",
      description: "서버/클라이언트 경계 설정과 데이터 패칭 전략 비교.",
      keywords: ["server", "client", "nextjs"],
      categoryName: "Next.js",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 33).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      slug: "state-cache",
      title: "상태 관리와 캐시 무효화 전략",
      description: "React Query 캐시 정책과 UI 반응성 최적화 방법.",
      keywords: ["react-query", "cache", "state"],
      categoryName: "Data",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      slug: "icons-design-tokens",
      title: "아이콘 시스템과 디자인 토큰 정리",
      description: "아이콘 매핑/그룹화, 디자인 토큰으로 통일된 UI 구성.",
      keywords: ["icons", "design-tokens", "ui"],
      categoryName: "Design",
      isPublished: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 9,
      slug: "a-very-very-very-long-title-to-test-ellipsis-and-wrapping",
      title:
        "아주아주 긴 타이틀을 만들어서 2줄 ellipsis가 제대로 동작하는지 확인합니다. 화면이 줄어들어도 2줄까지만 보이고 나머지는 말줄임 처리됩니다.",
      categoryName: "Test",
      isPublished: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: null,
      description:
        "긴 설명도 2줄까지만 표시되며, 남는 부분은 ellipsis로 처리됩니다. 다양한 길이를 가진 텍스트를 통해 UI 안정성을 확인합니다.",
      keywords: [
        "long",
        "ellipsis",
        "wrapping",
        "responsive",
        "typography",
        "layout",
      ],
    },
  ];

  return (
    <div className="with-page-toolbar">
      <PageTopToolBar>
        <Button>테스트</Button>
      </PageTopToolBar>
      <PageContainer.WithSidebar sidebarComponent={<CategorySidebar />}>
        {/* --- 메인 컨텐츠 영역 --- */}
        {/* 토픽 콘텐츠 */}
        <div className="flex flex-col gap-12">
          {/* 핫 토픽 */}
          {/* <PageTopToolbar
        leftSideComponents={<span className="font-semibold">글 목록</span>}
        rightSideComponents={
          <Link href="/admin/post/create">
            <Button size="sm">
              <Icon name="FilePlus" /> 새 글 작성
            </Button>
          </Link>
        }
        /> */}
          {/* NEW 토픽 */}
          <PostCardGrid
            items={_items}
            hrefBase="/admin/post"
            hrefField="id"
            className="mt-4"
          />
        </div>
      </PageContainer.WithSidebar>
    </div>
  );
};

export default AdminPostPage;
