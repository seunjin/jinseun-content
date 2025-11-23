# SEO 개요 및 체크리스트

이 문서는 블로그 프로젝트에 적용된 SEO 관련 설정과, 앞으로 보완할 수 있는 항목들을 정리합니다.  
검색 엔진에서 블로그가 어떻게 보이고, 어떤 신호를 주고 있는지 한눈에 파악하는 것을 목표로 합니다.

## 현재 적용된 항목

- **전역 메타데이터 (`src/app/layout.tsx`)**
  - 사이트 제목: `Jinseun Dev Blog`
  - 한 줄 설명: 새로운 기술 탐구, 구현 과정, 문제 해결 경험, 프로젝트 회고, 개발 철학 정리
  - Open Graph / Twitter 기본 메타 설정
  - `metadataBase`를 통해 절대 URL 기반 메타데이터 생성 (`NEXT_PUBLIC_SITE_URL` 사용, 없으면 `http://localhost:3000`)

- **페이지별 메타데이터**
  - 홈/목록 페이지: 카테고리/페이지 번호에 따라 동적 타이틀·설명 생성
  - 게시글 상세(`/post/[slug]`):
    - `title`: `"{post.title} | Jinseun Dev Blog"`
    - `description`: 게시글 설명이 있으면 우선 사용, 없으면 사이트 한 줄 소개 사용
    - `keywords`: `posts.keywords` 컬럼 값을 그대로 반영
    - canonical: 슬러그 기반(`{SITE_URL}/post/{slug}`)

- **URL 구조**
  - 게시글 상세 페이지를 `/post/[slug]` 형태로 제공
  - 목록/카드에서는 slug 기반 링크(`/post/{slug}`)를 사용

- **sitemap / robots.txt**
  - `src/app/sitemap.ts`: 루트 페이지와 공개된 게시글 목록을 포함한 `sitemap.xml` 생성
  - `src/app/robots.ts`:
    - `allow`: `/`, `/post/`
    - `disallow`: `/admin/`, `/api/`
    - `sitemap`: `{SITE_URL}/sitemap.xml`

- **JSON-LD (구조화 데이터)**
  - 사이트 전체 (`src/app/layout.tsx`):
    - `@type: "WebSite"` + `Person` (author: "Jinseun")
    - 사이트 이름, 설명, URL, 작성자 정보를 구조화 데이터로 노출
  - 게시글 상세 (`src/app/(public)/post/[slug]/page.tsx`):
    - `@type: "BlogPosting"`
    - `headline`, `description`, `image`, `datePublished`, `dateModified`, `author(Person)`, `mainEntityOfPage` 등 포함

- **RSS 피드**
  - `src/app/rss.xml/route.ts`:
    - 공개된 최신 게시글 기준 RSS 2.0 피드 생성
    - 각 아이템은 `title`, `link`, `guid`, `pubDate`, `description`을 포함

## 앞으로 보완할 수 있는 항목

- **도메인 및 환경 변수 정리**
  - 실제 배포 도메인을 구매/연결한 뒤 `NEXT_PUBLIC_SITE_URL`을 프로덕션 환경에서 반드시 설정합니다.
  - 로컬/프리뷰/프로덕션 환경별로 올바른 origin이 메타데이터·JSON-LD·RSS에 반영되는지 체크합니다.

- **OG 기본 이미지 준비**
  - `public/og-default.png` 파일을 추가해 기본 공유 이미지 품질을 보완합니다.
  - 필요하다면 카테고리/특정 포스트에 맞는 커스텀 OG 이미지를 점진적으로 도입합니다.

- **컨텐츠 가이드**
  - 제목, 설명, 슬러그, 키워드를 작성할 때의 기준을 간단히 정리합니다.
    - 제목: 핵심 키워드 + 구체적인 맥락
    - 설명: 80~160자 이내의 요약 문장
    - 슬러그: 영문 소문자 + 하이픈, 너무 길지 않게
    - 키워드: 3~5개 이내, 실제 내용과 밀접한 단어만 사용

- **내부 링크 및 관련 글**
  - 카테고리/키워드를 활용해 관련 글 목록을 노출하고, 내부 링크를 강화합니다.
  - 프로젝트가 성장하면 "연관 글" 섹션을 추가해 체류 시간을 늘릴 수 있습니다.

- **카테고리 페이지 강화**
  - 카테고리 설명(`categories.description`)을 적극적으로 작성해, 카테고리별 목록 페이지 메타 설명과 본문 상단에 반영합니다.

- **추적 및 모니터링(선택)**
  - Search Console, Analytics 등을 연동해 검색 노출 상태와 클릭률을 모니터링합니다.
  - 에러 리포트(잘못된 링크, 404, 크롤링 이슈)를 기반으로 sitemap/robots/리다이렉트 전략을 보완할 수 있습니다.

## 운영 시 체크 포인트

- 새 기능을 추가하거나 URL 구조·메타데이터 정책을 변경할 때:
  - `src/app/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/post/[slug]/page.tsx`의 메타데이터/JSON-LD가 영향 받는지 확인합니다.
  - `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`에서 누락되거나 잘못된 URL이 없는지 함께 점검합니다.
- 새로운 도메인(예: 태그, 시리즈, 프로젝트 페이지)을 추가하면:
  - 이 문서의 "현재 적용된 항목"과 "앞으로 보완할 수 있는 항목" 섹션을 업데이트해, SEO 관점에서 놓치고 있는 부분이 없는지 검토합니다.

