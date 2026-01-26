import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import axios from "axios";
import logo from "../../assets/images/logo.png";

export default function AdminSignup() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const mobile = e.target.mobile.value.trim();

    try {
      // ✅ Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ✅ Send verification email (IMPORTANT)
      await sendEmailVerification(user, {
        url: "http://localhost:5173/verify-email",
        handleCodeInApp: true
      });

      // ✅ Call Netlify serverless function
      await axios.post("/.netlify/functions/adminRegister", {
        uid: user.uid,
        name,
        email,
        mobile
      });

      alert("✅ Admin created! Please verify your email.");
      nav("/verify-email");

    } catch (err) {
      console.error(err);

      if (err.response?.data?.error) {
        alert("❌ " + err.response.data.error);
      } else if (err.code === "auth/email-already-in-use") {
        alert("❌ Email already in use.");
      } else if (err.code === "auth/weak-password") {
        alert("❌ Password must be at least 6 characters.");
      } else {
        alert("❌ Signup failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/35 to-white/40" />

      <div className="relative hidden md:flex flex-col justify-center px-16 z-10">
        <img src={logo} alt="Logo" className="h-20 mb-6 w-fit" />
        <h1 className="text-4xl font-bold text-red-900">
          Margdarshak Career Institute
        </h1>
        <p className="text-zinc-700 mt-4">Create the main admin account</p>
      </div>

      <div className="relative z-10 flex items-center justify-center px-6">
        <form
          onSubmit={submit}
          className="w-full max-w-sm bg-white/80 rounded-2xl shadow-2xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold">Admin Signup</h2>

          <input name="name" required placeholder="Full Name" className="input" />
          <input name="email" type="email" required placeholder="Email" className="input" />
          <input name="mobile" required placeholder="Mobile Number" className="input" />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="input pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
