import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, setAccessToken } from "../api/client";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    setAccessToken(res.data.access_token);
    setUser(res.data.user);
  }

  async function register(email: string, password: string) {
    await api.post("/auth/register", { email, password });
    await login(email, password);
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, register, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
