import { apiClient } from "./client";
import { DEMO_MODE } from "../demoMode";
import * as demo from "../demo/mockApi";
import type { Project } from "../types";

export interface CreateProjectPayload {
  name: string;
  niche?: string;
  target_audience?: string;
  tone_of_voice?: string;
}

export async function listProjects(): Promise<Project[]> {
  if (DEMO_MODE) return demo.listProjects();
  const { data } = await apiClient.get<Project[]>("/projects");
  return data;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  if (DEMO_MODE) return demo.createProject(payload);
  const { data } = await apiClient.post<Project>("/projects", payload);
  return data;
}

export async function updateProject(projectId: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
  if (DEMO_MODE) return demo.updateProject(projectId, payload);
  const { data } = await apiClient.patch<Project>(`/projects/${projectId}`, payload);
  return data;
}
