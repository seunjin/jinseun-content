"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { categoryRowSchema } from "@features/categories/schemas";
import { createHttpClient } from "@shared/lib/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

const categoriesResponseSchema = z.object({
  data: categoryRowSchema.array(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
});

const httpClient = createHttpClient();

const categoriesQueryKey = ["categories"];

const fetchCategories = async () => {
  const result = await httpClient.get<{
    response: CategoryRow[];
  }>("/api/categories", {
    schema: categoriesResponseSchema,
  });

  return result.data;
};

/**
 * @description 카테고리 목록을 react-query로 관리하는 훅입니다.
 * - 서버에서 전달받은 초기 데이터를 `initialData`로 등록합니다.
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
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "카테고리 목록을 불러오는 중 오류가 발생했습니다."
        : null;

  return {
    categories: categoryList,
    isFetching,
    isRefetching,
    refetch,
    error: errorMessage,
  };
};
