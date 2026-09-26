import { apiClient } from "./client";
import type { BrandKit } from "../types";

export type BrandKitUpdatePayload = Partial<
  Pick<BrandKit, "logo_media_id" | "color_primary" | "color_secondary" | "color_accent" | "font_heading" | "font_body">
>;

export async function getBrandKit(projectId: string): Promise<BrandKit> {
  const { data } = await apiClient.get<BrandKit>(`/projects/${projectId}/brand-kit`);
  return data;
}

export async function updateBrandKit(projectId: string, payload: BrandKitUpdatePayload): Promise<BrandKit> {
  const { data } = await apiClient.patch<BrandKit>(`/projects/${projectId}/brand-kit`, payload);
  return data;
}
