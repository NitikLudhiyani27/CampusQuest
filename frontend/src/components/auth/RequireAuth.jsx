import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a splash screen
  return user ? children : <Navigate to="/" replace />;
}