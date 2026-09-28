import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, refreshSession, setAccessToken, setRefreshToken } from "../api/client";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  function applyAuthResponse(res: AuthResponse) {
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
    setUser(res.user);
  }

  useEffect(() => {
    refreshSession()
      .then((res) => {
        if (res) setUser(res.user);
      })
      .finally(() => setInitializing(false));

    function handleForcedLogout() {
      setUser(null);
    }
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    applyAuthResponse(res.data);
  }

  async function register(email: string, password: string) {
    await api.post("/auth/register", { email, password });
    try {
      await login(email, password);
    } catch {
      throw new Error(
        "Account created, but automatic sign-in failed. Please log in.",
      );
    }
  }

  function logout() {
    const refreshToken = localStorage.getItem("tojtech_refresh_token");
    if (refreshToken) {
      // Best-effort: revoke server-side too, not just the local copy.
      // Fire-and-forget — logout should feel instant even if this is slow.
      api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", initializing, login, register, logout }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}