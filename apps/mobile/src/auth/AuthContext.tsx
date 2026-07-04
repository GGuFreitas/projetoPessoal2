import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { AuthResponseBody } from "@organizalar/contracts";
import * as authApi from "../api/auth.js";
import { clearToken, getToken, setToken } from "./storage.js";

type AuthUser = AuthResponseBody["user"];

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setTokenState(storedToken);
        try {
          const me = await authApi.getMe();
          setUser(me);
        } catch {
          // token expirado/inválido — desloga silenciosamente
          await clearToken();
          setTokenState(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const { token: newToken, user: loggedUser } = await authApi.login({ email, password });
    await setToken(newToken);
    setTokenState(newToken);
    setUser(loggedUser);
  }

  async function register(email: string, password: string) {
    const { token: newToken, user: newUser } = await authApi.register({ email, password });
    await setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }

  async function logout() {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }

  async function refreshUser() {
    setUser(await authApi.getMe());
  }

  const value = useMemo(
    () => ({ isLoading, token, user, login, register, logout, refreshUser }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
