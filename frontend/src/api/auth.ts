import { apiClient } from "./client";
import type { User } from "../types";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(email: string, password: string, fullName: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/register", {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
