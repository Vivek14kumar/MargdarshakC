import { Navigate } from "react-router-dom";
import useAuth from "../hooks/userAuth";

export default function UserProtected({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but email not verified
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Logged in + verified
  return children;
}
