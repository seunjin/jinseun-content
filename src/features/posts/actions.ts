"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { revalidatePath } from "next/cache";
import { createPostsApi } from "./api";
import type { CreatePostInput, UpdatePostInput } from "./schemas";

/**
 * @description 새로운 게시글을 생성합니다.
 */
export async function createPostAction(payload: CreatePostInput) {
  const supabase = await createServerSupabase();
  const api = createPostsApi(supabase);

  const post = await api.createPost(payload);

  revalidatePath("/admin/posts");
  revalidatePath("/posts");

  return post;
}

/**
 * @description 기존 게시글을 수정합니다.
 */
export async function updatePostAction(payload: UpdatePostInput) {
  const supabase = await createServerSupabase();
  const api = createPostsApi(supabase);

  const post = await api.updatePost(payload);

  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${post.slug}`);

  return post;
}

/**
 * @description 게시글을 삭제합니다.
 */
export async function deletePostAction(id: number) {
  const supabase = await createServerSupabase();
  const api = createPostsApi(supabase);

  await api.deletePost(id);

  revalidatePath("/admin/posts");
  revalidatePath("/posts");
}
