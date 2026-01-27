import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import {
  collection,
  getDocs
} from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";
import SEO from "../../components/SEO";
import logo from "../../assets/images/logo.png";

export default function StudentSignup() {
  const nav = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState("");
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);

  /* ================= PASSWORD STRENGTH ================= */
  useEffect(() => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) setPasswordStrength("Weak");
    else if (score <= 3) setPasswordStrength("Medium");
    else setPasswordStrength("Strong");
  }, [password]);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(firestore, "courses"));
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const mobile = form.mobile.value.trim();
    const selectedCourse = form.studentCourse.value;

    try {
      /* ---------- Validation ---------- */
      if (!/^\d{10}$/.test(mobile)) {
        setError("Enter a valid 10-digit mobile number.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      /* ---------- Firebase Auth ---------- */
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCred.user);

      /* ---------- Serverless (SECURE DB WRITE) ---------- */
      const res = await fetch("/.netlify/functions/studentRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userCred.user.uid,
          name,
          email,
          mobile,
          course: selectedCourse
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setShowVerifyMsg(true);

      setTimeout(() => {
        nav("/verify-email");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO
    title="SignUp – Margdarshak Career Institute"/>
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-red-50 to-white">

      {/* ================= LEFT ================= */}
      <div className="hidden md:flex flex-col justify-center px-16">
        <img src={logo} alt="Logo" className="h-20 mb-6 w-fit" />
        <h1 className="text-4xl font-bold text-red-600">
          Margdarshak Career Institute
        </h1>
        <p className="text-gray-700 mt-4 text-lg">
          Create your account and access verified study materials.
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="flex items-center justify-center px-6">
        <form
          onSubmit={submit}
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Student Signup
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <input name="name" required placeholder="Full Name" className="input mb-4" />
          <input name="email" type="email" required placeholder="Email" className="input mb-4" />
          <input name="mobile" required placeholder="Mobile Number" className="input mb-4" />

          {loadingCourses ? (
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-4" />
          ) : (
            <select name="studentCourse" required className="input mb-4">
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          {/* PASSWORD */}
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              className="input pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {passwordStrength && (
            <p className={`text-xs mb-3 ${
              passwordStrength === "Weak"
                ? "text-red-500"
                : passwordStrength === "Medium"
                ? "text-yellow-500"
                : "text-green-600"
            }`}>
              Password Strength: {passwordStrength}
            </p>
          )}

          {/* CONFIRM PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="input pr-10"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 mb-4 rounded-xl
            bg-gradient-to-r from-red-500 to-red-700
            text-white font-medium hover:brightness-110
            transition disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account & Enroll"}
          </button>

          {showVerifyMsg && (
            <p className="text-xs text-green-600 text-center">
              ✅ Verification email sent. Please check your inbox.
            </p>
          )}
        </form>
      </div>
    </div>
    </>
  );
}
