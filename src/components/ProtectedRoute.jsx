import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <p className="text-sm text-navy-400">Soo dejinaya...</p>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
