import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/userAuth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

export default function ProtectedRoute({
  children,
  role = "student", // "student" | "admin"
}) {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      // 🔄 Still checking auth
      if (loading) return;

      // ❌ Not logged in
      if (!user) {
        if (isMounted) setAuthorized("unauthorized");
        return;
      }

      // ⚠️ Email not verified
      if (!user.emailVerified) {
        if (isMounted) setAuthorized("verify");
        return;
      }

      // 👑 Admin check
      if (role === "admin") {
        try {
          const snap = await getDoc(
            doc(firestore, "users", user.uid)
          );

          if (!snap.exists() || !snap.data()?.isAdmin) {
            if (isMounted) setAuthorized("unauthorized");
            return;
          }
        } catch (err) {
          console.error("Admin check failed", err);
          if (isMounted) setAuthorized("unauthorized");
          return;
        }
      }

      // ✅ Authorized
      if (isMounted) setAuthorized("authorized");
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [user, loading, role]);

  /* ================= UI STATES ================= */

  // ⏳ Loading (important for PWA/TWA cold start)
  if (loading || authorized === "checking") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Checking authentication...
      </div>
    );
  }

  // 🚫 Unauthorized
  if (authorized === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  // ⚠️ Email verification required
  if (authorized === "verify") {
    return (
      <Navigate
        to={
          role === "admin"
            ? "/verify-email"
            : "/student/verify-email"
        }
        replace
      />
    );
  }

  // ✅ Authorized
  return children;
}
