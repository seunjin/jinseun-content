"use client";

import type { CategoryRow } from "@features/categories/schemas";
import { categoryRowSchema } from "@features/categories/schemas";
import { clientHttp } from "@shared/lib/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

/**
 * @description 서버에서 내려주는 카테고리 API 응답 구조를 검증하는 Zod 스키마입니다.
 * - 존재 여부, 타입을 보장해 런타임 오류를 최소화합니다.
 */
const categoriesResponseSchema = z.object({
  data: categoryRowSchema.array(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
});

/**
 * @description react-query 캐시에서 카테고리 목록을 구분하기 위한 키입니다.
 * - 동일 키로 invalidate하거나 refetch할 수 있습니다.
 */
const categoriesQueryKey = ["categories"];

/**
 * @description 실제 API 호출을 수행해 카테고리 데이터를 받아오는 비동기 함수입니다.
 * - Zod 스키마를 이용해 응답을 검증한 뒤 정규화된 데이터만 반환합니다.
 */
const fetchCategories = async () => {
  const result = await clientHttp.get<{
    response: CategoryRow[];
  }>("/api/categories", {
    schema: categoriesResponseSchema,
  });

  return result.data;
};

/**
 * @description 카테고리 목록을 react-query로 관리하는 훅입니다.
 * - 서버 컴포넌트에서 전달받은 초기 데이터(initialCategories)를 캐시에 주입합니다.
 * - 서버에서 전달받은 초기 데이터를 `initialData`로 등록합니다.
 */
export const useCategoriesQuery = (initialCategories: CategoryRow[]) => {
  /**
   * @description 카테고리 목록 요청에 대한 캐시 상태를 관리합니다.
   * - isFetching: 현재 쿼리 함수 실행 여부
   * - isRefetching: 수동 refetch 단계인지 여부
   * - error: 쿼리 함수에서 던진 에러 객체
   */
  const { data, isFetching, isRefetching, refetch, error } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    initialData: initialCategories,
    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 30,
  });

  /**
   * @description 쿼리 결과가 undefined일 때를 대비해 배열로 강제 변환합니다.
   */
  const categoryList = useMemo(() => data ?? [], [data]);
  /**
   * @description 에러 객체를 사람 친화적인 메시지로 변환합니다.
   */
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
