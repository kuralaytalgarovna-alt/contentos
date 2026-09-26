import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Drives the mobile sidebar drawer only — on desktop the sidebar is always
// visible regardless of this flag (see the max-width: 768px media query).
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
