import { apiClient } from "./client";
import type { MediaAsset } from "../types";

export async function listMedia(projectId: string): Promise<MediaAsset[]> {
  const { data } = await apiClient.get<MediaAsset[]>(`/projects/${projectId}/media`);
  return data;
}

export async function uploadMedia(projectId: string, file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<MediaAsset>(`/projects/${projectId}/media/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateMediaTags(projectId: string, mediaId: string, tags: string): Promise<MediaAsset> {
  const { data } = await apiClient.patch<MediaAsset>(`/projects/${projectId}/media/${mediaId}`, { tags });
  return data;
}

export async function deleteMedia(projectId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/media/${mediaId}`);
}
