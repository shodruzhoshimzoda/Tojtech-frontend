import axios from "axios";
import type { ApiErrorBody, AuthResponse } from "../types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
const REFRESH_TOKEN_KEY = "tojtech_refresh_token";

export const api = axios.create({ baseURL });

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Exchanges the refresh token stored in localStorage for a fresh access
 * token (the API also rotates the refresh token itself on every call).
 * Returns null if there's no stored token or it's no longer valid.
 */
export async function refreshSession(): Promise<AuthResponse | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    // Plain axios, not `api` — going through `api` here would loop back
    // into the response interceptor below.
    const res = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    setAccessToken(res.data.access_token);
    setRefreshToken(res.data.refresh_token);
    return res.data;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return null;
  }
}

let refreshPromise: Promise<AuthResponse | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (!original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null;
      });
    }

    const result = await refreshPromise;
    if (result) {
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${result.access_token}`;
      return api(original);
    }

    window.dispatchEvent(new Event("auth:logout"));
    return Promise.reject(error);
  },
);

export function extractError(err: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const data = err.response?.data;
    if (data?.error_description) return data.error_description;
    if (data?.error) return data.error;
    if (err.message === "Network Error") {
      return "Can't reach the server. Is the API running?";
    }
    return "Something went wrong. Please try again.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}