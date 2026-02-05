import type { Database } from "@lib/supabase/database.types";
import { z } from "zod";

/**
 * @description 카테고리 조회 결과 타입입니다 (Frontend Domain Model).
 */
export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * @description 카테고리 행을 검증하는 스키마입니다.
 */
export const categoryRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  isVisible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * @description 카테고리 생성 입력을 검증하는 스키마입니다.
 */
export const createCategoryInputSchema = z.object({
  name: z.string().min(1, "카테고리명을 입력하세요."),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요.")
    .regex(/^[a-z0-9-]+$/, "슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다."),
  description: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
});

const categoryIdSchema = z
  .number()
  .int("카테고리 ID는 정수여야 합니다.")
  .positive("카테고리 ID는 1 이상이어야 합니다.");

const sortOrderFieldSchema = z
  .number()
  .int("정렬 순서는 정수여야 합니다.")
  .min(0, "정렬 순서는 0 이상의 숫자여야 합니다.");

/**
 * @description 카테고리 생성 입력 타입입니다.
 */
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

/**
 * @description 카테고리 수정 입력을 검증하는 스키마입니다.
 */
export const updateCategoryInputSchema = z.object({
  id: categoryIdSchema,
  name: z.string().min(1, "카테고리명을 입력하세요.").optional(),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요.")
    .regex(/^[a-z0-9-]+$/, "슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다.")
    .optional(),
  description: z.string().optional().nullable(),
  isVisible: z.boolean().optional(),
  sortOrder: sortOrderFieldSchema.optional(),
});

/**
 * @description 카테고리 수정 입력 타입입니다.
 */
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

/**
 * @description 카테고리 정렬 순서를 일괄 변경할 때 사용하는 입력 스키마입니다.
 */
export const reorderCategoriesInputSchema = z.object({
  orderings: z
    .array(
      z.object({
        id: categoryIdSchema,
        sortOrder: sortOrderFieldSchema,
      }),
    )
    .nonempty("최소 한 개 이상의 정렬 정보가 필요합니다."),
});

/**
 * @description 카테고리 정렬 입력 타입입니다.
 */
export type ReorderCategoriesInput = z.infer<
  typeof reorderCategoriesInputSchema
>;
