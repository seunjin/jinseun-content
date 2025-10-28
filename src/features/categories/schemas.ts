import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categories } from "../../../drizzle/schema";

/**
 * @description 카테고리 조회 결과 타입입니다.
 * - Supabase에서 반환된 행을 타입 안전하게 다루기 위해 사용합니다.
 */
export type CategoryRow = InferSelectModel<typeof categories>;

/**
 * @description 카테고리 행을 검증하는 스키마입니다.
 */
export const categoryRowSchema = createSelectSchema(categories);

const rawInsertSchema = createInsertSchema(categories, {
  name: z.string().min(1, "카테고리명을 입력하세요."),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요.")
    .regex(/^[a-z0-9-]+$/, "슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다."),
}).pick({
  name: true,
  slug: true,
  description: true,
  isVisible: true,
});

/**
 * @description 카테고리 생성 입력을 검증하는 스키마입니다.
 */
export const createCategoryInputSchema = rawInsertSchema
  .pick({
    name: true,
    slug: true,
    description: true,
    isVisible: true,
  })
  .extend({
    isVisible: rawInsertSchema.shape.isVisible.default(true),
  });

const sortOrderFieldSchema = createInsertSchema(categories, {
  sortOrder: z
    .number()
    .int("정렬 순서는 정수여야 합니다.")
    .min(0, "정렬 순서는 0 이상의 숫자여야 합니다."),
}).shape.sortOrder.describe("정렬 순서는 0 이상 정수입니다.");

const categoryIdSchema = z
  .number()
  .int("카테고리 ID는 정수여야 합니다.")
  .positive("카테고리 ID는 1 이상이어야 합니다.");

const editableFieldsSchema = rawInsertSchema
  .extend({
    sortOrder: sortOrderFieldSchema,
  })
  .pick({
    name: true,
    slug: true,
    description: true,
    isVisible: true,
    sortOrder: true,
  });

/**
 * @description 카테고리 생성 입력 타입입니다.
 */
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

/**
 * @description 카테고리 수정 입력을 검증하는 스키마입니다.
 * - 부분 업데이트를 허용합니다.
 */
export const updateCategoryInputSchema = z
  .object({
    id: categoryIdSchema,
  })
  .and(editableFieldsSchema.partial());

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
