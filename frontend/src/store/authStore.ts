import { create } from "zustand";
import { DEMO_MODE } from "../demoMode";
import type { User } from "../types";

const TOKEN_STORAGE_KEY = "contentos.token";
const DEMO_TOKEN = "demo-token";

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // In demo mode there's no real backend to authenticate against, so skip
  // the login screen entirely — the app is authenticated from first paint.
  token: DEMO_MODE ? DEMO_TOKEN : localStorage.getItem(TOKEN_STORAGE_KEY),
  user: null,
  setToken: (token) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null });
  },
}));
