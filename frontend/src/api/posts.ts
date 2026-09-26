import { apiClient } from "./client";
import type { Platform, Post, PostFormat, PostStatus } from "../types";

export interface CreatePostPayload {
  title?: string;
  body?: string;
  cta?: string;
  hashtags?: string;
  platform: Platform;
  format?: PostFormat;
  status?: PostStatus;
  scheduled_at?: string | null;
  cover_media_id?: string | null;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

export async function listPosts(projectId: string): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>(`/projects/${projectId}/posts`);
  return data;
}

export async function createPost(projectId: string, payload: CreatePostPayload): Promise<Post> {
  const { data } = await apiClient.post<Post>(`/projects/${projectId}/posts`, payload);
  return data;
}

export async function updatePost(projectId: string, postId: string, payload: UpdatePostPayload): Promise<Post> {
  const { data } = await apiClient.patch<Post>(`/projects/${projectId}/posts/${postId}`, payload);
  return data;
}

export async function deletePost(projectId: string, postId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/posts/${postId}`);
}
