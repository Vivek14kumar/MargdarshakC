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
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      // Not logged in
      if (!user) {
        setAuthorized(false);
        return;
      }

      // Email not verified
      if (!user.emailVerified) {
        setAuthorized("verify");
        return;
      }

      // Admin role check
      if (role === "admin") {
        const docRef = doc(firestore, "users", user.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists() || !snap.data().isAdmin) {
          setAuthorized(false);
          return;
        }
      }

      setAuthorized(true);
    };

    if (!loading) checkAccess();
  }, [user, loading, role]);

  // ⏳ Loading state
  if (loading || authorized === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  // 🚫 Not logged in or unauthorized
  if (authorized === false) {
    return (
      <Navigate
        to={role === "admin" ? "/login" : "/login"}
        replace
      />
    );
  }

  
  // ⚠️ Email not verified
  if (authorized === "verify") {
    return (
      <Navigate
        to={role === "admin" ? "/verify-email" : "/student/verify-email"}
        replace
      />
    );
  }

  // ✅ Authorized
  return children;
}
