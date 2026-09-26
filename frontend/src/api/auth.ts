import { apiClient } from "./client";
import { DEMO_MODE } from "../demoMode";
import * as demo from "../demo/mockApi";
import type { User } from "../types";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(email: string, password: string, fullName: string): Promise<TokenResponse> {
  if (DEMO_MODE) return { ...(await demo.register(email, password, fullName)), token_type: "bearer" };
  const { data } = await apiClient.post<TokenResponse>("/auth/register", {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  if (DEMO_MODE) return { ...(await demo.login(email, password)), token_type: "bearer" };
  const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  if (DEMO_MODE) return demo.fetchMe();
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
