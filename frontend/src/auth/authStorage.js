export const TOKEN_KEY = "mystogan:access-token";

export const ROLE_LABELS = {
  admin: "Administrador",
  hr: "RH",
  manager: "Gerente",
  employee: "Funcionário",
  stock: "Estoque",
};

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      roleLabel: ROLE_LABELS[decoded.role] || decoded.role,
    };
  } catch {
    return null;
  }
}

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = token ? decodeToken(token) : null;

  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }

  return { token, user };
}
