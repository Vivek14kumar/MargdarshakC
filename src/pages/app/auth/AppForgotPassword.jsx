import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth, firestore } from "../../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import logo from "../../../assets/images/logo.png";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (!email) {
      setMessage("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Check Firestore if email exists
      const usersRef = collection(firestore, "users"); // replace "users" with your collection name
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("No user found with this email.");
        setSuccess(false);
        setLoading(false);
        return;
      }

      // 2️⃣ Send password reset email via Firebase Auth
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox (and spam folder).");
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Try again later.");
      setSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative grid grid-cols-1 md:grid-cols-2 overflow-hidden">

      {/* LEFT BRAND SECTION */}
      <div className="relative hidden md:flex flex-col justify-center px-16 z-10">
        <img src={logo} alt="Logo" className="h-20 mb-6 w-fit" />
        <h1 className="text-4xl font-bold text-red-900 leading-tight">
          Margdarshak <br /> Career Institute
        </h1>
        <p className="text-zinc-700 mt-4 max-w-md text-lg">
          Secure admin access is managed centrally by institute authorities.
        </p>
        <div className="mt-8 h-1 w-20 bg-gradient-to-r from-red-600 to-red-900 rounded-full" />
      </div>

      {/* RIGHT CONTENT */}
      <div className="relative z-10 flex items-center justify-center px-6">
        <div className="w-full max-w-sm backdrop-blur-xl bg-white/75 border border-red-200 rounded-2xl shadow-2xl p-8 text-center">

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Forgot Password
          </h2>

          <p className="text-sm text-gray-700 mb-6">
            Enter your registered email to reset your password.
          </p>

          {/* MESSAGE */}
          {message && (
            <div
              className={`border rounded-xl px-4 py-3 text-sm mb-4 ${
                success
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* EMAIL INPUT */}
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-medium shadow-md hover:brightness-110 transition"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          {/* ACTIONS */}
          <div className="mt-6 space-y-3 text-sm">
            <button
              onClick={() => nav("/app/login")}
              className="w-full py-2.5 rounded-xl bg-red-100 text-red-700 font-medium shadow-md hover:brightness-105 transition"
            >
              Back to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
