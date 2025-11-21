# Supabase SQL + Zod 사용 가이드

## 목적
- Supabase CLI가 생성·적용하는 SQL 마이그레이션을 단일 진실 소스로 유지합니다.
- 런타임 데이터 검증은 Zod로 통일해 API 응답과 입력 값의 신뢰도를 확보합니다.
- 팀 내 공통 플로우를 문서화하여 작업자 간 커뮤니케이션 비용을 줄입니다.

## 마이그레이션 운영 원칙
1. `supabase migration new <name>`으로 빈 마이그레이션 파일을 생성합니다. 파일은 `supabase/migrations/`에 `YYYYMMDDHHMMSS_<name>.sql` 형태로 추가됩니다.
2. 생성된 SQL 파일 안에 DDL/seed 쿼리를 작성합니다. 기존 스키마 수정 시 `ALTER TABLE`, 신규 테이블은 `CREATE TABLE` 등 명시적으로 작성합니다.
3. 적용 전 `supabase db lint`로 기본 검증을 수행합니다. 문제가 없다면 `supabase db push`로 로컬 DB에 적용하고 결과를 확인합니다.
4. 마이그레이션이 성공하면 관련 애플리케이션 코드(Zod 스키마, Supabase SDK 호출부)를 동시에 업데이트합니다.
5. PR 전에는 `supabase db reset --local`로 전체 마이그레이션이 재현되는지 확인합니다. 충돌이 발생하면 순서를 조정하거나 새 마이그레이션을 작성합니다.

### 체크리스트
- [ ] 새 SQL 파일에 변경 의도가 한글 주석으로 명시되어 있는가?
- [ ] `supabase db push` 후 주요 테이블 구조/권한을 점검했는가?
- [ ] Zod 스키마와 SDK 타입 정의가 최신 마이그레이션을 반영하는가?

## Zod 기반 데이터 검증 플로우
1. **입력 검증**: 사용자 입력이나 외부 파라미터는 요청 직전에 `z.object({...}).safeParse`로 검증합니다. 실패 시 사용자 메시지와 로깅 전략을 통일합니다.
2. **SDK 응답 검증**: Supabase SDK 호출 후 반환되는 `data` 객체는 대응하는 Zod 스키마로 검증합니다. 실패 시 API 호출 결과를 로그에 남기고 적절한 에러를 반환합니다.
3. **타입 연동**: 스키마에서 `export type HotTopic = z.infer<typeof hotTopicSchema>`처럼 타입을 추출해 TypeScript 타입과 런타임 검증이 일치하게 유지합니다.
4. **스키마 분리**: 입력/응답의 형태가 다르면 스키마를 별도로 정의합니다. 예를 들어 `hotTopicInsertSchema`, `hotTopicResponseSchema`처럼 목적별로 나눕니다.
5. **Supabase SDK + Drizzle 타입 연계**: 테이블 CRUD는 Supabase JS SDK를 사용하고, 정적 타입은 `pnpm dlx drizzle-kit introspect`로 생성된 Drizzle schema를 기반으로 합니다. 생성된 타입을 Zod 스키마와 함께 재사용하면, 런타임과 컴파일 타임 타입 안전성을 동시에 확보할 수 있습니다.

```ts
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const newTopicSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  category: z.string(),
});

const topicRowSchema = newTopicSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
});

type TopicRow = z.infer<typeof topicRowSchema>;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function createTopic(payload: unknown) {
  const parsedPayload = newTopicSchema.safeParse(payload);
  if (!parsedPayload.success) {
    throw new Error(parsedPayload.error.message);
  }

  const { data, error } = await supabase
    .from("topics")
    .insert(parsedPayload.data)
    .select()
    .single();

  if (error) throw error;

  const parsedResponse = topicRowSchema.safeParse(data);
  if (!parsedResponse.success) {
    throw new Error("응답 스키마가 예상과 다릅니다.");
  }

  return parsedResponse.data satisfies TopicRow;
}
```

## 협업 규칙과의 연관성
- SQL 파일과 Zod 스키마에는 변경 의도를 한글 주석으로 기록합니다.
- 변경 전후 범위를 반드시 팀과 공유해 사전 합의를 얻습니다.
- PR 전 `pnpm format`, `pnpm lint`와 함께 `supabase db push` 결과를 확인했다는 내용을 공유합니다.

## 참고 명령어 모음
- `supabase migration new <name>`: 새 SQL 마이그레이션 템플릿 생성
- `supabase db push`: 작성한 마이그레이션을 로컬 DB에 적용
- `supabase db reset --local`: 로컬 DB를 드롭 후 모든 마이그레이션을 재적용
- `supabase gen types typescript --local > src/types/supabase.ts`: 최신 DB 스키마 기반 TypeScript 타입 생성
- `pnpm db:introspect`: Supabase 스키마를 기반으로 Drizzle schema 및 TypeScript 타입을 생성

## 로컬/원격 Supabase DB 동기화 개념 정리

Supabase CLI 명령은 **원격 프로젝트 DB**와 **로컬 개발용 DB(Postgres Docker)** 를 각각 대상으로 동작합니다. 헷갈리지 않도록 용도를 구분해 사용합니다.

### 1. 원격 DB(웹 콘솔에서 보이는 DB)에 마이그레이션 적용

- 사용 명령어:
  ```bash
  supabase db push
  ```
- 특징:
  - Supabase Cloud 프로젝트(Studio에서 보는 DB)에 `supabase/migrations` 폴더의 새 SQL 파일들을 순서대로 적용합니다.
  - 로그 예시:
    - `Connecting to remote database...`
    - `Applying migration 20251120081327_create_posts.sql`
  - Git 브랜치/마이그레이션 버전이 어긋나면 `migration repair`를 통해 히스토리를 조정해야 할 수 있습니다:
    ```bash
    supabase migration repair --status reverted <version>
    supabase db push
    ```

### 2. 로컬 개발용 DB에 마이그레이션 적용

로컬에서 Next.js 앱을 Supabase와 함께 개발할 때는 **로컬 Supabase 스택(Postgres + API)** 를 먼저 띄우고, 해당 DB에 스키마를 재적용해야 합니다.

1. 로컬 Supabase 스택 시작
   ```bash
   supabase start
   ```
   - Docker Desktop이 실행 중이어야 합니다.
   - 로컬 Postgres(기본 54322), Supabase API(54321) 등이 컨테이너로 뜹니다.

2. 로컬 DB를 현재 마이그레이션 기준으로 재구성
   ```bash
   supabase db reset
   ```
   - 로컬 Postgres DB를 드롭한 뒤 `supabase/migrations` 아래의 파일들을 순서대로 적용합니다.
   - 새 테이블(예: `posts`)을 추가하는 경우, 이 단계 이후에야 로컬 Studio에서도 해당 테이블이 보입니다.

3. Drizzle 스키마/타입 갱신 (선택)
   ```bash
   pnpm db:introspect
   ```
   - 실제 DB 구조를 기준으로 `drizzle/schema.ts`를 최신 상태로 맞춥니다.

### 3. 예시: posts 테이블 추가 플로우

1. 마이그레이션 템플릿 생성
   ```bash
   supabase migration new create_posts
   ```
   → `supabase/migrations/XXXXXXXXXXXXXX_create_posts.sql` 생성

2. 새 SQL 파일에 posts 테이블 및 RLS 정책 작성
   ```sql
   create table if not exists public.posts (
     id serial primary key,
     category_id integer not null references public.categories(id),
     title varchar(200) not null,
     slug varchar(200) not null unique,
     description text,
     keywords text[],
     thumbnail_url text,
     content text,
     is_published boolean not null default false,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   alter table if exists public.posts enable row level security;
   alter table if exists public.posts force row level security;

   -- 발행된 글만 모든 사용자가 조회 가능
   create policy "posts_select_published"
     on public.posts
     for select
     using (is_published = true);
   ```

3. 원격 DB에 적용
   ```bash
   supabase db push
   ```

4. 로컬 개발 DB에 동일 스키마 적용
   ```bash
   supabase start
   supabase db reset
   pnpm db:introspect
   ```

이 과정을 거치면:
- Supabase Studio(원격)와 로컬 Studio 모두에서 `posts` 테이블을 확인할 수 있고,
- 애플리케이션 코드에서 Drizzle/Zod 스키마를 일관된 구조로 사용할 수 있습니다.

## 예시 시나리오: 신규 테이블 추가 후 타입 반영

### 1. 마이그레이션 생성 및 작성
```bash
supabase migration new add_topics_table
```
- `supabase/migrations/<timestamp>_add_topics_table.sql` 파일에 `CREATE TABLE topics (...)` 등 SQL을 작성합니다.

### 2. 로컬 DB에 적용 및 검증
```bash
supabase db lint
supabase db push
```
- 오류가 없으면 변경된 스키마를 확인하고, 필요한 경우 `supabase db reset --local`로 전체 재적용 테스트를 수행합니다.

### 3. Drizzle schema & 타입 갱신
```bash
pnpm db:introspect
```
- `drizzle/schema.ts` 등 지정된 경로에 최신 스키마와 타입이 생성됩니다.

### 4. Zod 스키마 및 SDK 코드 업데이트
- 생성된 Drizzle 타입을 기반으로 Zod 스키마(예: `topicInsertSchema`, `topicRowSchema`)를 작성합니다.
- Supabase SDK로 CRUD 함수를 구성하고, 입력/응답을 Zod 스키마로 검증합니다.

### 5. 문서 및 테스트 정리
- 작성한 SQL 파일에 주석으로 변경 의도를 남기고, 관련 문서를 갱신합니다.
- `pnpm format`, `pnpm lint`로 스타일/정적 검사를 통과한 뒤 커밋합니다.
