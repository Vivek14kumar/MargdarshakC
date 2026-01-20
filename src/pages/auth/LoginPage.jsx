import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import logo from "../../assets/images/logo.webp";

export default function LoginPage() {
  const nav = useNavigate();
  const isSubmitting = useRef(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError("");
    setLoading(true);

    const loginInput = e.target.login.value.trim();
    const password = e.target.password.value;

    try {
      let emailToUse = "";

      /* ------------------ EMAIL OR MOBILE CHECK ------------------ */
      if (/^\d{10}$/.test(loginInput)) {
        // Mobile login
        const q = query(
          collection(firestore, "users"),
          where("mobile", "==", loginInput)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error("No account found with this mobile number");
        }

        emailToUse = snap.docs[0].data().email;
      }
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput)) {
        // Email login
        emailToUse = loginInput;
      }
      else {
        throw new Error("Enter valid email or 10-digit mobile number");
      }

      /* ------------------ FIREBASE AUTH LOGIN ------------------ */
      await signInWithEmailAndPassword(auth, emailToUse, password);

      /* ------------------ FETCH USER ROLE ------------------ */
      const roleQuery = query(
        collection(firestore, "users"),
        where("email", "==", emailToUse)
      );

      const roleSnap = await getDocs(roleQuery);

      if (roleSnap.empty) {
        throw new Error("User profile not found. Contact admin.");
      }

      const { role } = roleSnap.docs[0].data();

      /* ------------------ ROLE BASED REDIRECT ------------------ */
      if (role === "admin") {
        nav("/admin/dashboard", { replace: true });
      }
      else if (role === "student") {
        nav("/student/dashboard", { replace: true });
      }
      else {
        throw new Error("Unauthorized role access");
      }

    } catch (err) {
      console.error(err);

      let message = "Login failed. Please try again.";

      switch (err.code) {
        case "auth/user-not-found":
          message = "No account found with this email or mobile number";
          break;
        case "auth/wrong-password":
          message = "Incorrect password";
          break;
        case "auth/invalid-credential":
          message = "Incorrect login credentials";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later";
          break;
        default:
          if (err.message) message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Branding */}
      <div className="hidden md:flex flex-col justify-center px-16">
        <img src={logo} alt="Logo" className="h-20 w-fit mb-6" />
        <h1 className="text-4xl font-bold text-red-600">
          Margdarshak Career Institute
        </h1>
        <p className="mt-4 text-gray-700 text-lg">
          Login using email or mobile number securely
        </p>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-6">
        <form
          onSubmit={submit}
          noValidate
          className="w-full max-w-sm bg-white border rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-semibold mb-1">Login</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your credentials
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <input
            name="login"
            type="text"
            placeholder="Email or Mobile Number"
            className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-200"
          />

          <div className="relative mb-5">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-200"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="flex justify-between mt-4 text-xs text-gray-600">
            <span
              onClick={() => nav("/forgot-password")}
              className="cursor-pointer hover:text-red-600"
            >
              Forgot Password?
            </span>
            <span
              onClick={() => nav("/signup")}
              className="cursor-pointer hover:text-red-600 font-bold"
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
