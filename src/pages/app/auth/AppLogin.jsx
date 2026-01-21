import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../../.././firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import logo from "../../../assets/images/logo.webp";

export default function AppLogin() {
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

      // Mobile login
      if (/^\d{10}$/.test(loginInput)) {
        const q = query(
          collection(firestore, "users"),
          where("mobile", "==", loginInput)
        );
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("No account found with this mobile number");
        emailToUse = snap.docs[0].data().email;
      }
      // Email login
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput)) {
        emailToUse = loginInput;
      } else {
        throw new Error("Enter valid email or mobile number");
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);

      const roleQuery = query(
        collection(firestore, "users"),
        where("email", "==", emailToUse)
      );
      const roleSnap = await getDocs(roleQuery);
      if (roleSnap.empty) throw new Error("User profile not found");

      const { role } = roleSnap.docs[0].data();

      if (role === "student") {
        nav("/student/dashboard", { replace: true });
      } else if (role === "admin") {
        nav("/admin/dashboard", { replace: true });
      } else {
        throw new Error("Unauthorized role");
      }

    } catch (err) {
      let msg = "Login failed";
      if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16" />
        </div>

        <h2 className="text-xl font-bold text-center mb-1">Student Login</h2>
        <p className="text-sm text-gray-600 text-center mb-5">
          Login to continue
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <input
          name="login"
          placeholder="Email or Mobile"
          className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-300"
        />

        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-xs mt-4 text-gray-600">
          <span onClick={() => nav("/app/signup")} className="font-bold">
            Sign Up
          </span>
          <span onClick={() => nav("/app/forgot-password")}>
            Forgot Password?
          </span>
        </div>
      </form>
    </div>
  );
}
