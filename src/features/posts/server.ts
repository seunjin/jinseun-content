"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { createPostsApi, type FetchPostsOptions } from "./api";
import type { CreatePostInput } from "./schemas";

/**
 * @description 서버에서 게시글 목록을 조회합니다.
 * - 공개 페이지에서는 onlyPublished 옵션을 활용해 발행된 글만 노출합니다.
 */
export async function fetchPostsServer(options: FetchPostsOptions = {}) {
  const supabase = await createServerSupabase();
  return createPostsApi(supabase).fetchPosts(options);
}

/**
 * @description 서버에서 게시글 목록과 총 개수를 함께 조회합니다.
 * - 페이지네이션을 구성할 때 사용합니다.
 */
export async function fetchPostsWithCountServer(
  options: FetchPostsOptions = {},
) {
  const supabase = await createServerSupabase();
  return createPostsApi(supabase).fetchPostsWithCount(options);
}

/**
 * @description ID 기준으로 단일 게시글을 조회합니다.
 */
export async function fetchPostByIdServer(id: number) {
  const supabase = await createServerSupabase();
  return createPostsApi(supabase).fetchPostById(id);
}

/**
 * @description 신규 게시글을 생성합니다.
 * - isPublished 값에 따라 비공개(초안) 또는 공개(발행) 상태로 저장됩니다.
 */
export async function createPostServer(payload: CreatePostInput) {
  const supabase = await createServerSupabase();
  return createPostsApi(supabase).createPost(payload);
}
