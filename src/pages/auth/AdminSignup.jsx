import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
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
      // ✅ CHECK IF ADMIN ALREADY EXISTS (SAFE QUERY)
      const q = query(
        collection(firestore, "users"),
        where("isAdmin", "==", true)
      );
      const adminSnap = await getDocs(q);

      if (!adminSnap.empty) {
        alert("❌ Admin already exists. Only one admin is allowed.");
        setLoading(false);
        return;
      }

      // ✅ CREATE AUTH USER
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ✅ SAVE ADMIN DATA (MATCHES ProtectedRoute)
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        mobile,
        isAdmin: true,
        role: "admin",
        createdAt: serverTimestamp()
      });

      // ✅ SEND EMAIL VERIFICATION
      await sendEmailVerification(user);

      alert("✅ Admin created! Please verify your email.");
      nav("/verify-email");

    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        alert("❌ Email already in use. Please login.");
      } else if (err.code === "auth/weak-password") {
        alert("❌ Password must be at least 6 characters.");
      } else {
        alert("❌ Signup failed. Check console.");
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
          className="w-full max-w-sm bg-white/80 rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Admin Signup</h2>

          <input name="name" required placeholder="Full Name" className="input" />
          <input name="email" type="email" required placeholder="Email" className="input" />
          <input name="mobile" required placeholder="Mobile Number" className="input" />

          <div className="relative mb-4">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="input"
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
