import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { posts } from "../../../drizzle/schema";

/**
 * @description 게시글 조회 결과 타입입니다.
 * - Supabase에서 반환된 posts 레코드를 타입 안전하게 다루기 위해 사용합니다.
 */
export type PostRow = InferSelectModel<typeof posts>;

/**
 * @description posts 행을 검증하는 스키마입니다.
 */
export const postRowSchema = createSelectSchema(posts);

/**
 * @description 게시글 생성 입력을 검증하는 스키마입니다.
 * - 제목, 슬러그, 카테고리 ID는 필수입니다.
 * - description은 최대 200자까지만 허용합니다.
 * - keywords는 최대 5개까지, 각 키워드는 1자 이상 32자 이하입니다.
 * - content는 BlockNote 문서를 직렬화한 JSON 데이터입니다.
 */
export const createPostInputSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요.")
    .regex(/^[a-z0-9-]+$/, "슬러그는 영문 소문자, 숫자, 하이픈만 허용합니다."),
  categoryId: z
    .number()
    .int("카테고리 ID는 정수여야 합니다.")
    .positive("카테고리 ID는 1 이상이어야 합니다."),
  description: z
    .string()
    .max(200, "설명은 200자 이내로 입력하세요.")
    .optional(),
  keywords: z
    .array(
      z
        .string()
        .min(1, "키워드는 1자 이상이어야 합니다.")
        .max(32, "키워드는 32자 이하여야 합니다."),
    )
    .max(5, "키워드는 최대 5개까지 입력할 수 있습니다.")
    .optional(),
  thumbnailUrl: z
    .string()
    .url("썸네일은 올바른 URL 형식이어야 합니다.")
    .optional(),
  /**
   * @description BlockNote 에디터에서 생성된 문서 JSON입니다.
   * - 프런트엔드에서는 BlockNote의 `editor` 인스턴스에서 JSON을 추출한 뒤 문자열로 직렬화해 전달합니다.
   * - 서버에서는 이 문자열을 그대로 DB에 저장합니다.
   */
  content: z.string().optional(),
  /**
   * @description 게시글 발행 여부입니다.
   * - false: 비공개(초안 상태, 일반 사용자는 조회 불가)
   * - true: 공개(모든 사용자가 조회 가능)
   */
  isPublished: z.boolean().default(false),
});

/**
 * @description 게시글 생성 입력 타입입니다.
 */
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

/**
 * @description 게시글 수정 입력을 검증하는 스키마입니다.
 * - 생성 스키마(createPostInputSchema)에 ID 필드를 추가한 형태입니다.
 * - 제목, 슬러그, 카테고리 ID 등은 모두 필수이며, 부분 업데이트는 지원하지 않습니다.
 */
export const updatePostInputSchema = createPostInputSchema.extend({
  id: z
    .number()
    .int("게시글 ID는 정수여야 합니다.")
    .positive("게시글 ID는 1 이상이어야 합니다."),
});

/**
 * @description 게시글 수정 입력 타입입니다.
 */
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
