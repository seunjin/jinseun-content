# 아키텍처 가이드: Supabase & Server Actions

이 문서는 프로젝트의 복잡도를 낮추고 Next.js 15의 성능을 극대화하기 위해 채택된 **Supabase 전용 아키텍처**를 설명합니다.

## 1. 아키텍처 개요

기존의 Drizzle ORM과 API Route(Ky) 레이어를 제거하고, Supabase가 제공하는 PostgREST와 Next.js Server Actions를 직접적으로 활용합니다.

- **진실의 소스 (Source of Truth)**: Supabase Local Database
- **데이터 변경 (Write)**: Next.js Server Actions
- **데이터 조회 (Read)**: Supabase Direct Client (Server/Client)
- **타입 안정성**: Supabase Generated Types + Zod

## 2. 주요 패턴

### 2.1. Server Actions (Write)
데이터를 변경(Create, Update, Delete)할 때는 API 라우트 대신 서버 액션을 사용합니다.

```typescript
// feature/example/actions.ts
"use server"

export async function createItemAction(payload: CreateItemInput) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('items').insert(payload).select().single();
  // ...후처리 및 캐시 갱신(revalidatePath)
}
```

### 2.2. Direct Supabase Query & Alias (Read)
조회 시에는 SDK를 직접 사용하며, DB의 `snake_case` 컬럼을 alias를 통해 프런트엔드의 `camelCase`로 즉시 매핑합니다.

```typescript
// feature/example/api.ts
const ITEM_SELECT = "id, title, createdAt:created_at, isPublished:is_published" as const;

export async function fetchItems() {
  const supabase = createClient();
  const { data } = await supabase.from('items').select(ITEM_SELECT);
  return data; // 이미 camelCase로 매핑되어 있음
}
```

### 2.3. 타입 관리
`supabase gen types` 명령어를 통해 생성된 `database.types.ts`를 표준으로 사용합니다.

```bash
# 타입 갱신 명령어
pnpm supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts
```

## 3. 왜 이 방식을 사용하나요?

1. **Boilerplate 감소**: Drizzle 스키마를 별도로 유지할 필요가 없습니다.
2. **네트워크 비용 절감**: 불필요한 API 라우트 호출 오버헤드가 사라집니다.
3. **타입 정합성**: DB 구조가 변경되면 CLI를 통해 즉시 타입에 반영됩니다.
4. **RLS 보안**: 서버 API 구현 없이도 DB 레벨에서 정교한 권한 제어가 가능합니다.
