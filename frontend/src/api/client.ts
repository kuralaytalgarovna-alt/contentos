import axios from "axios";
import { useAuthStore } from "../store/authStore";

const rawApiUrl = import.meta.env.VITE_API_URL ?? "";
// Some deployment platforms (e.g. Render's `fromService` blueprint env vars)
// inject a bare hostname rather than a full origin — default to https in
// that case so the app still works with just "same-origin" (empty) or a
// full "https://host" value too.
const apiOrigin = rawApiUrl && !rawApiUrl.includes("://") ? `https://${rawApiUrl}` : rawApiUrl;

export const apiClient = axios.create({
  baseURL: `${apiOrigin}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
