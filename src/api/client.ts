import axios from "axios";
import type { ApiErrorBody } from "../types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

export const api = axios.create({ baseURL });

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * The API replies with {"error": "...", "error_description": "..."} on failure.
 * This pulls a single readable line out of that shape, whatever axios throws.
 */
export function extractError(err: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const data = err.response?.data;
    if (data?.error_description) return data.error_description;
    if (data?.error) return data.error;
    if (err.message === "Network Error") {
      return "Can't reach the server. Is the API running?";
    }
  }
  return "Something went wrong. Please try again.";
}
