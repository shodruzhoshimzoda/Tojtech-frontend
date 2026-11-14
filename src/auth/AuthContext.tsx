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
  register: (email: string, username: string, password: string) => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

  async function register(email: string, username: string, password: string) {
    await api.post("/auth/register", { email, username, password });
    try {
      await login(email, password);
    } catch {
      throw new Error(
        "Account created, but automatic sign-in failed. Please log in.",
      );
    }
  }

  // PATCH /me: the server answers with the updated user, so the name in the panels changes at once
  async function updateProfile(username: string) {
    const res = await api.patch<{ user: User }>("/me", { username });
    setUser(res.data.user);
  }

  // POST /me/password: the server revokes all old sessions and gives this device a new one
  async function changePassword(currentPassword: string, newPassword: string) {
    const res = await api.post<AuthResponse>("/me/password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    applyAuthResponse(res.data);
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
    () => ({
      user,
      isAdmin: user?.role === "admin",
      initializing,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}