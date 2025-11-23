# 프로젝트 개요

이 레포지토리는 Next.js 기반으로 구축된 **블로그 프로젝트**입니다.  
개인/팀이 글을 작성·관리하고, 카테고리별로 공개할 수 있는 관리용·공개용 인터페이스를 제공합니다.

## 블로그 주요 기능

- 게시글 작성/수정/삭제 및 발행(공개)/비공개(초안) 관리
- 카테고리별 목록 조회와 필터링
- 썸네일, 설명, 키워드(SEO용 태그) 등의 메타데이터 관리
- 프로필/권한(마스터, 에디터, 일반 사용자)에 따른 관리 기능 구분
- Supabase 정책을 활용한 안전한 읽기/쓰기 제어

## 기술 스택

- Next.js App Router (`src/app`)
- TypeScript
- Supabase (Postgres DB, Auth, Storage)
- Drizzle ORM (`drizzle/schema.ts`)
- Biome 기반 포맷/린트 (`biome.json`)
- pnpm, Lefthook

## 상위 디렉터리 구조

- `src/app`: 라우팅 및 페이지 레이아웃
- `src/features`: 도메인별 기능 모듈
  - `posts`: 게시글 CRUD 및 목록/페이지네이션
  - `categories`: 카테고리 관리
  - `profiles`: 작성자/프로필 관리
- `src/ui`: 공통 컴포넌트, 레이아웃, UI 훅
- `src/shared`: 공통 유틸리티와 상수
- `src/providers`: 전역 Provider (테마, React Query 등)
- `src/hooks`: Supabase 세션 등 공용 훅
- `supabase`: DB 스키마, 정책, 스토리지 설정
- `drizzle`: Drizzle 스키마 및 메타데이터 (`drizzle/schema.ts`)
- `docs`: 운영/설계 문서 모음

## 데이터 모델 개요

- `posts`
  - 블로그 게시글 본문과 메타데이터(카테고리, 썸네일, 키워드, 발행 여부 등)를 저장합니다.
  - `src/features/posts/schemas.ts`/`api.ts`/`server.ts`에서 타입·쿼리·서버 액션을 관리합니다.
- `categories`
  - 게시글을 그룹화하기 위한 카테고리 정보를 저장합니다.
  - `src/features/categories/*` 에서 스키마·API·서버 로직을 다룹니다.
- `profiles`
  - 작성자/관리자 계정 정보와 역할(마스터/에디터/사용자)을 관리합니다.
  - 허용 이메일 화이트리스트(`allowed_emails`)와 함께 로그인/권한 정책에 사용됩니다.

## 권한 및 접근 제어 개요

- 역할(`profile_role` enum)
  - `master`: 블로그 전체 설정과 카테고리/게시글/프로필을 완전히 관리할 수 있는 최고 관리 권한입니다.
  - `editor`: 게시글 작성·수정 등 에디터용 기능을 담당하도록 확장 가능한 역할입니다.
  - `user`: 일반 사용자 역할로, 기본적으로 읽기 위주의 권한을 갖습니다.
- 허용 이메일(`allowed_emails`)
  - 로그인 및 관리자 접근이 허용된 이메일 목록을 관리합니다.
  - `is_login_allowed` 플래그로 로그인 허용 여부를 제어하며, 초대자는 `invited_by` 필드로 연결됩니다.
- Supabase RLS 정책
  - `posts`: 마스터 이메일은 모든 게시글을 조회할 수 있고, 그 외에는 `is_published = true` 인 게시글만 조회 가능합니다.
  - `categories`: 마스터 이메일만 카테고리 생성/수정/삭제가 가능하며, 조회는 모두에게 허용됩니다.
  - `storage.assets` 버킷: 모든 사용자가 이미지를 읽을 수 있지만, 업로드/수정/삭제는 인증된 사용자만 가능합니다.

## 동작 개요

- 게시글 데이터는 Supabase Postgres에 저장되며 Drizzle 스키마에 맞춰 타입이 정의됩니다.
- 서버 컴포넌트 및 서버 액션에서 Supabase 클라이언트를 생성해 `src/features/*/server.ts`를 통해 도메인별 로직을 호출합니다.
- 클라이언트/서버에서 공통으로 사용할 수 있는 API 헬퍼는 `src/features/*/api.ts`에 정의합니다.
- UI 레벨에서는 `src/ui`와 `src/app`을 중심으로, 게시글 목록·상세·카테고리·프로필 정보를 조합해 화면을 구성합니다.

## 게시글 작성/발행 플로우 개요

- 공개 블로그
  - 루트 경로(`/`)는 `src/app/(public)/page.tsx`를 통해 구성되며, 카테고리/페이지네이션이 적용된 게시글 목록을 보여줍니다.
  - 이 목록은 항상 `onlyPublished: true` 옵션으로 조회되어, 공개된 게시글만 노출됩니다.
- 관리자 영역
  - `/admin/*` 경로는 `src/app/(admin)/(protected)/layout.tsx`에서 Supabase 세션을 확인해, 로그인하지 않은 사용자를 `/admin/signin`으로 리다이렉트합니다.
  - 게시글 생성 페이지는 `/admin/post/create` 이며, `CreatePostForm`를 통해 제목/내용/카테고리/발행 여부 등을 입력합니다.
  - 게시글 목록 관리 화면에서는 공개/비공개 필터, 상태별 카운트, 카드 목록(`AdminPostList`)을 통해 전체 게시글을 관리합니다.

## 개발 및 실행

- 패키지 매니저는 항상 `pnpm`을 사용합니다.
  - 개발 서버 실행: `pnpm dev`
  - 포맷/린트: `pnpm format`, `pnpm lint`
- Supabase 및 Drizzle 관련 마이그레이션은 각 폴더(`supabase/`, `drizzle/`)의 설정과 문서를 우선 확인한 뒤 실행합니다.

## 문서 유지 규칙

아래 상황에서는 반드시 이 문서를 업데이트해야 합니다.

- 새로운 도메인(예: 태그, 댓글 등)이 추가되었을 때
- 기존 도메인 구조/플로우가 의미 있게 변경되었을 때
- 주요 기술 스택 또는 외부 의존성에 변경이 생겼을 때

변경 시, 상기 섹션(기술 스택, 디렉터리 구조, 동작 개요 등)을 최신 상태로 맞춰 주세요.
