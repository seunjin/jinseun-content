import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CreatePostInput,
  createPostInputSchema,
  type PostRow,
  postRowSchema,
  type UpdatePostInput,
  updatePostInputSchema,
} from "./schemas";

const POST_SELECT =
  "id, category_id, title, slug, description, keywords, thumbnail_url, content, is_published, created_at, updated_at";

type AnySupabaseClient = SupabaseClient;

type RawPostRow = {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  keywords: string[] | null;
  thumbnail_url: string | null;
  content: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * @description Supabase가 반환한 게시글 행을 Drizzle 스키마 형태로 변환합니다.
 */
const mapPostRow = (row: RawPostRow) => ({
  id: row.id,
  categoryId: row.category_id,
  title: row.title,
  slug: row.slug,
  description: row.description,
  keywords: row.keywords,
  thumbnailUrl: row.thumbnail_url,
  content: row.content,
  isPublished: row.is_published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export type FetchPostsOptions = {
  /**
   * @description 공개된 글만 조회할지 여부입니다.
   * - true: is_published = true 인 게시글만 반환합니다.
   * - false 또는 생략: 모든 게시글을 반환합니다. (추후 관리자 전용으로 사용 예정)
   */
  onlyPublished?: boolean;
  /**
   * @description 특정 카테고리에 속한 글만 조회할 때 사용하는 카테고리 ID입니다.
   */
  categoryId?: number;
};

/**
 * @description 게시글 목록을 조회합니다.
 * - 기본 정렬은 최신 작성 순(생성일 내림차순)입니다.
 */
async function fetchPosts(
  client: AnySupabaseClient,
  options: FetchPostsOptions = {},
): Promise<PostRow[]> {
  const query = client
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });

  if (options.onlyPublished) {
    query.eq("is_published", true);
  }

  if (options.categoryId !== undefined) {
    query.eq("category_id", options.categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) return [];

  return postRowSchema.array().parse(data.map(mapPostRow));
}

/**
 * @description ID 기준으로 단일 게시글을 조회합니다.
 */
async function fetchPostById(
  client: AnySupabaseClient,
  id: number,
): Promise<PostRow | null> {
  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return postRowSchema.parse(mapPostRow(data as RawPostRow));
}

/**
 * @description 게시글을 신규 생성합니다.
 * - description은 최대 200자, keywords는 최대 5개까지 허용합니다.
 * - content는 BlockNote JSON 문자열로 저장합니다.
 */
async function createPost(
  client: AnySupabaseClient,
  payload: CreatePostInput,
): Promise<PostRow> {
  const parsed = createPostInputSchema.parse(payload);

  const { data, error } = await client
    .from("posts")
    .insert({
      category_id: parsed.categoryId,
      title: parsed.title,
      slug: parsed.slug,
      description: parsed.description ?? null,
      keywords:
        parsed.keywords && parsed.keywords.length > 0 ? parsed.keywords : null,
      thumbnail_url: parsed.thumbnailUrl ?? null,
      content: parsed.content ?? null,
      is_published: parsed.isPublished,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  if (!data) throw new Error("게시글 생성에 실패했습니다.");

  return postRowSchema.parse(mapPostRow(data as RawPostRow));
}

/**
 * @description 기존 게시글을 수정합니다.
 * - 부분 업데이트가 아닌, 전달된 전체 필드 값으로 덮어씁니다.
 */
async function updatePost(
  client: AnySupabaseClient,
  payload: UpdatePostInput,
): Promise<PostRow> {
  const parsed = updatePostInputSchema.parse(payload);
  const { id, ...patch } = parsed;

  const { data, error } = await client
    .from("posts")
    .update({
      category_id: patch.categoryId,
      title: patch.title,
      slug: patch.slug,
      description: patch.description ?? null,
      keywords:
        patch.keywords && patch.keywords.length > 0 ? patch.keywords : null,
      thumbnail_url: patch.thumbnailUrl ?? null,
      content: patch.content ?? null,
      is_published: patch.isPublished,
    })
    .eq("id", id)
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  if (!data) throw new Error("게시글 업데이트에 실패했습니다.");

  return postRowSchema.parse(mapPostRow(data as RawPostRow));
}

/**
 * @description 게시글 API 헬퍼를 생성합니다.
 * - 서버/클라이언트에서 동일하게 사용할 수 있도록 구성합니다.
 */
export function createPostsApi(client: AnySupabaseClient) {
  return {
    fetchPosts: (options?: FetchPostsOptions) => fetchPosts(client, options),
    fetchPostById: (id: number) => fetchPostById(client, id),
    createPost: (payload: CreatePostInput) => createPost(client, payload),
    updatePost: (payload: UpdatePostInput) => updatePost(client, payload),
  };
}
