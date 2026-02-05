"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { categoryRowSchema } from "@features/categories/schemas";
import { createClient } from "@lib/supabase/client.supabase";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

/**
 * @description react-query 캐시에서 카테고리 목록을 구분하기 위한 키입니다.
 */
const categoriesQueryKey = ["categories"];

/**
 * @description 실제 API 호출을 수행해 카테고리 데이터를 받아오는 비동기 함수입니다.
 */
const fetchCategories = async (): Promise<CategoryRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, sortOrder:sort_order, isVisible:is_visible, createdAt:created_at, updatedAt:updated_at",
    )
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  // Zod 검증 (Alias 결과에 맞춰 검증 가능하도록 스키마 활용)
  return z.array(categoryRowSchema).parse(data);
};

/**
 * @description 카테고리 목록을 react-query로 관리하는 훅입니다.
 */
export const useCategoriesQuery = (initialCategories: CategoryRow[]) => {
  const { data, isFetching, isRefetching, refetch, error } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    initialData: initialCategories,
    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 30,
  });

  const categoryList = useMemo(() => data ?? [], [data]);
  const errorMessage = error instanceof Error ? error.message : null;

  return {
    categories: categoryList,
    isFetching,
    isRefetching,
    refetch,
    error: errorMessage,
  };
};
