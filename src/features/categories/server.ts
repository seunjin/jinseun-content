"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import type { FetchCategoriesOptions } from "./api";
import { createCategoriesApi } from "./api";
import type {
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "./schemas";

/**
 * @description 서버에서 카테고리 목록을 조회합니다.
 * - 공개 페이지에서는 onlyVisible 옵션을 활용해 노출 여부를 필터링합니다.
 */
export async function fetchCategoriesServer(
  options: FetchCategoriesOptions = {},
) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).fetchCategories(options);
}

/**
 * @description ID 기준으로 카테고리를 조회합니다.
 */
export async function fetchCategoryByIdServer(id: number) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).fetchCategoryById(id);
}

/**
 * @description 슬러그 기준으로 카테고리를 조회합니다.
 */
export async function fetchCategoryBySlugServer(slug: string) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).fetchCategoryBySlug(slug);
}

/**
 * @description 신규 카테고리를 생성합니다.
 */
export async function createCategoryServer(payload: CreateCategoryInput) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).createCategory(payload);
}

/**
 * @description 기존 카테고리를 수정합니다.
 */
export async function updateCategoryServer(payload: UpdateCategoryInput) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).updateCategory(payload);
}

/**
 * @description 카테고리를 삭제합니다.
 */
export async function deleteCategoryServer(id: number) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).deleteCategory(id);
}

/**
 * @description 카테고리 정렬 순서를 일괄 조정합니다.
 */
export async function reorderCategoriesServer(payload: ReorderCategoriesInput) {
  const supabase = await createServerSupabase();
  return createCategoriesApi(supabase).reorderCategories(payload);
}
