"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { revalidatePath } from "next/cache";
import { createCategoriesApi } from "./api";
import type {
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "./schemas";

/**
 * @description 신규 카테고리를 생성합니다.
 */
export async function createCategoryAction(payload: CreateCategoryInput) {
  const supabase = await createServerSupabase();
  const api = createCategoriesApi(supabase);

  const category = await api.createCategory(payload);

  revalidatePath("/admin/category");
  // 공개 페이지 카테고리 목록도 갱신이 필요할 수 있습니다.
  revalidatePath("/", "layout"); 

  return category;
}

/**
 * @description 기존 카테고리를 수정합니다.
 */
export async function updateCategoryAction(payload: UpdateCategoryInput) {
  const supabase = await createServerSupabase();
  const api = createCategoriesApi(supabase);

  const category = await api.updateCategory(payload);

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");

  return category;
}

/**
 * @description 카테고리를 삭제합니다.
 */
export async function deleteCategoryAction(id: number) {
  const supabase = await createServerSupabase();
  const api = createCategoriesApi(supabase);

  await api.deleteCategory(id);

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");
}

/**
 * @description 카테고리 정렬 순서를 일괄 조정합니다.
 */
export async function reorderCategoriesAction(payload: ReorderCategoriesInput) {
  const supabase = await createServerSupabase();
  const api = createCategoriesApi(supabase);

  await api.reorderCategories(payload);

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");
}
