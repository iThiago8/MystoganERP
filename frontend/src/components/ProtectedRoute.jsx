import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
