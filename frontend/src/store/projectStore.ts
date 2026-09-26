import { create } from "zustand";
import type { Project } from "../types";

const CURRENT_PROJECT_STORAGE_KEY = "contentos.currentProjectId";

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProjectId: (projectId: string) => void;
  currentProject: () => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProjectId: localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY),
  setProjects: (projects) => {
    set((state) => {
      const stillValid = projects.some((p) => p.id === state.currentProjectId);
      const currentProjectId = stillValid ? state.currentProjectId : (projects[0]?.id ?? null);
      if (currentProjectId) {
        localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, currentProjectId);
      }
      return { projects, currentProjectId };
    });
  },
  setCurrentProjectId: (projectId) => {
    localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, projectId);
    set({ currentProjectId: projectId });
  },
  currentProject: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.currentProjectId);
  },
}));
