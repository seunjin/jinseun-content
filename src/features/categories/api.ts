import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CategoryRow,
  type CreateCategoryInput,
  categoryRowSchema,
  createCategoryInputSchema,
  type ReorderCategoriesInput,
  reorderCategoriesInputSchema,
  type UpdateCategoryInput,
  updateCategoryInputSchema,
} from "./schemas";

const CATEGORY_SELECT =
  "id, name, slug, description, sort_order, is_visible, created_at, updated_at";

type AnySupabaseClient = SupabaseClient;

type RawCategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * @description Supabase가 반환한 카테고리 행을 Drizzle 스키마 형태로 변환합니다.
 */
const mapCategoryRow = (row: RawCategoryRow) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  sortOrder: row.sort_order,
  isVisible: row.is_visible,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export type FetchCategoriesOptions = {
  onlyVisible?: boolean;
};

/**
 * @description 최종 정렬 순서 값을 계산합니다.
 * - 지정된 sortOrder가 없으면 현재 최대값 + 1을 반환합니다.
 */
async function resolveNextSortOrder(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const lastOrder = data?.sort_order ?? -1;
  return lastOrder + 1;
}

/**
 * @description 카테고리 목록을 정렬 기준에 맞춰 조회합니다.
 */
async function fetchCategories(
  client: AnySupabaseClient,
  options: FetchCategoriesOptions = {},
): Promise<CategoryRow[]> {
  const query = client
    .from("categories")
    .select(CATEGORY_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (options.onlyVisible) {
    query.eq("is_visible", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) return [];

  return categoryRowSchema.array().parse(data.map(mapCategoryRow));
}

/**
 * @description ID 기준으로 단일 카테고리를 조회합니다.
 */
async function fetchCategoryById(
  client: AnySupabaseClient,
  id: number,
): Promise<CategoryRow | null> {
  const { data, error } = await client
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return categoryRowSchema.parse(mapCategoryRow(data));
}

/**
 * @description 슬러그 기준으로 단일 카테고리를 조회합니다.
 */
async function fetchCategoryBySlug(
  client: AnySupabaseClient,
  slug: string,
): Promise<CategoryRow | null> {
  const { data, error } = await client
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return categoryRowSchema.parse(mapCategoryRow(data));
}

/**
 * @description 새로운 카테고리를 생성합니다.
 */
async function createCategory(
  client: AnySupabaseClient,
  payload: CreateCategoryInput,
): Promise<CategoryRow> {
  const parsedPayload = createCategoryInputSchema.parse(payload);
  const sortOrder = await resolveNextSortOrder(client);

  const { data, error } = await client
    .from("categories")
    .insert({
      name: parsedPayload.name,
      slug: parsedPayload.slug,
      description: parsedPayload.description ?? null,
      is_visible: parsedPayload.isVisible,
      sort_order: sortOrder,
    })
    .select(CATEGORY_SELECT)
    .single();

  if (error) throw error;
  if (!data) throw new Error("카테고리 생성에 실패했습니다.");

  return categoryRowSchema.parse(mapCategoryRow(data));
}

/**
 * @description 기존 카테고리를 수정합니다.
 */
async function updateCategory(
  client: AnySupabaseClient,
  payload: UpdateCategoryInput,
): Promise<CategoryRow> {
  const parsedPayload = updateCategoryInputSchema.parse(payload);
  const { id, ...patch } = parsedPayload;

  const updatePayload: Record<string, unknown> = {};

  if (patch.name !== undefined) updatePayload.name = patch.name;
  if (patch.slug !== undefined) updatePayload.slug = patch.slug;
  if (patch.description !== undefined)
    updatePayload.description = patch.description ?? null;
  if (patch.isVisible !== undefined) updatePayload.is_visible = patch.isVisible;
  if (patch.sortOrder !== undefined) updatePayload.sort_order = patch.sortOrder;

  if (Object.keys(updatePayload).length === 0) {
    return fetchCategoryById(client, id).then((row) => {
      if (!row) throw new Error("카테고리를 찾을 수 없습니다.");
      return row;
    });
  }

  const { data, error } = await client
    .from("categories")
    .update(updatePayload)
    .eq("id", id)
    .select(CATEGORY_SELECT)
    .single();

  if (error) throw error;
  if (!data) throw new Error("카테고리 업데이트에 실패했습니다.");

  return categoryRowSchema.parse(mapCategoryRow(data));
}

/**
 * @description 카테고리를 삭제합니다.
 */
async function deleteCategory(
  client: AnySupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw error;
}

/**
 * @description 카테고리 정렬 순서를 일괄 업데이트합니다.
 */
async function reorderCategories(
  client: AnySupabaseClient,
  payload: ReorderCategoriesInput,
): Promise<CategoryRow[]> {
  const parsed = reorderCategoriesInputSchema.parse(payload);
  const { orderings } = parsed;

  const { data, error } = await client
    .from("categories")
    .upsert(
      orderings.map((ordering) => ({
        id: ordering.id,
        sort_order: ordering.sortOrder,
      })),
      { onConflict: "id" },
    )
    .select(CATEGORY_SELECT)
    .in(
      "id",
      orderings.map((ordering) => ordering.id),
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return categoryRowSchema.array().parse(data.map(mapCategoryRow));
}

/**
 * @description 카테고리 API 헬퍼를 생성합니다.
 * - 서버/클라이언트에서 동일하게 사용할 수 있도록 구성합니다.
 */
export function createCategoriesApi(client: AnySupabaseClient) {
  return {
    fetchCategories: (options?: FetchCategoriesOptions) =>
      fetchCategories(client, options),
    fetchCategoryById: (id: number) => fetchCategoryById(client, id),
    fetchCategoryBySlug: (slug: string) => fetchCategoryBySlug(client, slug),
    createCategory: (payload: CreateCategoryInput) =>
      createCategory(client, payload),
    updateCategory: (payload: UpdateCategoryInput) =>
      updateCategory(client, payload),
    deleteCategory: (id: number) => deleteCategory(client, id),
    reorderCategories: (payload: ReorderCategoriesInput) =>
      reorderCategories(client, payload),
  };
}

export type CategoriesApi = ReturnType<typeof createCategoriesApi>;
