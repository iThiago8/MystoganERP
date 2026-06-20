import { useCallback, useMemo, useState } from "react";

import api from "../services/api";
import { AuthContext } from "./authContext";
import { decodeToken, getStoredSession, ROLE_LABELS, TOKEN_KEY } from "./authStorage";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const login = useCallback(async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data.access_token;
    const user = decodeToken(token);

    if (!user) {
      throw new Error("Token inválido.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setSession({ token: null, user: null });
  }, []);

  const hasAnyRole = useCallback(
    (roles = []) => {
      if (!roles.length) return Boolean(session.user);
      return roles.includes(session.user?.role);
    },
    [session.user]
  );

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.user),
      login,
      logout,
      hasAnyRole,
      roleLabels: ROLE_LABELS,
    }),
    [hasAnyRole, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
