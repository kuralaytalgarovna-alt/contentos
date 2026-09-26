import { apiClient } from "./client";
import { DEMO_MODE } from "../demoMode";
import * as demo from "../demo/mockApi";
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
  if (DEMO_MODE) return demo.listPosts(projectId);
  const { data } = await apiClient.get<Post[]>(`/projects/${projectId}/posts`);
  return data;
}

export async function createPost(projectId: string, payload: CreatePostPayload): Promise<Post> {
  if (DEMO_MODE) return demo.createPost(projectId, payload);
  const { data } = await apiClient.post<Post>(`/projects/${projectId}/posts`, payload);
  return data;
}

export async function updatePost(projectId: string, postId: string, payload: UpdatePostPayload): Promise<Post> {
  if (DEMO_MODE) return demo.updatePost(projectId, postId, payload);
  const { data } = await apiClient.patch<Post>(`/projects/${projectId}/posts/${postId}`, payload);
  return data;
}

export async function deletePost(projectId: string, postId: string): Promise<void> {
  if (DEMO_MODE) return demo.deletePost(projectId, postId);
  await apiClient.delete(`/projects/${projectId}/posts/${postId}`);
}
