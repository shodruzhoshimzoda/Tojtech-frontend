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

// Refresh tokens are single-use: every call revokes the old token. Two concurrent
// calls with the same token would invalidate each other, so every caller shares
// one in-flight request. React StrictMode runs the AuthProvider effect twice in
// development, and the 401 interceptor below can fire at the same time as well.
let refreshInFlight: Promise<AuthResponse | null> | null = null;

async function performRefresh(): Promise<AuthResponse | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    // Plain axios, not `api`, so the response interceptor below cannot loop.
    const res = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    setAccessToken(res.data.access_token);
    setRefreshToken(res.data.refresh_token);
    return res.data;
  } catch (err) {
    // Only an explicit rejection ends the session. A network error or a 5xx
    // keeps the stored token, so restarting the API does not log everyone out.
    if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      setAccessToken(null);
      setRefreshToken(null);
    }
    return null;
  }
}

export function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

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

    // A 401 from login/register/refresh means "wrong credentials", not "token expired".
    if (original.url?.startsWith("/auth/")) {
      return Promise.reject(error);
    }
    original._retry = true;

    const result = await refreshSession();
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
