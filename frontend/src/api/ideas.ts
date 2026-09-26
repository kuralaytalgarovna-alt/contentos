import { apiClient } from "./client";
import { DEMO_MODE } from "../demoMode";
import * as demo from "../demo/mockApi";
import type { Idea } from "../types";

export interface GenerateIdeasPayload {
  goal: "engagement" | "reach" | "sales";
  platform?: string;
  format?: string;
  count?: number;
}

export interface GeneratePostTextPayload {
  idea_id?: string;
  topic?: string;
  platform: string;
  format: string;
}

export interface GeneratedPostText {
  title: string;
  body: string;
  cta_options: string[];
  hashtags: string;
}

export async function listIdeas(projectId: string): Promise<Idea[]> {
  if (DEMO_MODE) return demo.listIdeas(projectId);
  const { data } = await apiClient.get<Idea[]>(`/projects/${projectId}/ideas`);
  return data;
}

export async function generateIdeas(projectId: string, payload: GenerateIdeasPayload): Promise<Idea[]> {
  if (DEMO_MODE) return demo.generateIdeas(projectId, payload);
  const { data } = await apiClient.post<Idea[]>(`/projects/${projectId}/ideas/generate`, payload);
  return data;
}

export async function generatePostText(
  projectId: string,
  payload: GeneratePostTextPayload,
): Promise<GeneratedPostText> {
  if (DEMO_MODE) return demo.generatePostText(projectId, payload);
  const { data } = await apiClient.post<GeneratedPostText>(`/projects/${projectId}/ideas/generate-text`, payload);
  return data;
}

export async function deleteIdea(projectId: string, ideaId: string): Promise<void> {
  if (DEMO_MODE) return demo.deleteIdea(projectId, ideaId);
  await apiClient.delete(`/projects/${projectId}/ideas/${ideaId}`);
}
