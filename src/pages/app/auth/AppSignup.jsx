import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, firestore } from "../../../firebaseConfig";
import logo from "../../../assets/images/logo.webp";

export default function AppSignup() {
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
    if (!password) return setPasswordStrength("");

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setPasswordStrength(
      score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong"
    );
  }, [password]);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      const snap = await getDocs(collection(firestore, "courses"));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingCourses(false);
    };
    fetchCourses();
  }, []);

  /* ================= DUPLICATE CHECK ================= */
  const fieldExists = async (field, value) => {
    const q = query(collection(firestore, "users"), where(field, "==", value));
    const snap = await getDocs(q);
    return !snap.empty;
  };

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
      if (!/^\d{10}$/.test(mobile))
        throw new Error("Enter valid 10-digit mobile number");

      if (password !== confirmPassword)
        throw new Error("Passwords do not match");

      if (await fieldExists("email", email))
        throw new Error("Email already registered");

      if (await fieldExists("mobile", mobile))
        throw new Error("Mobile already registered");

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCred.user);

      await setDoc(doc(firestore, "users", userCred.user.uid), {
        name,
        email,
        mobile,
        role: "student",
        enrolledCourses: [selectedCourse],
        createdAt: serverTimestamp()
      });

      setShowVerifyMsg(true);
      setTimeout(() => nav("/app/login"), 1500);

    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-14" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">
          Student Signup
        </h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <input name="name" required placeholder="Full Name" className="input mb-3" />
        <input name="email" required placeholder="Email" className="input mb-3" />
        <input name="mobile" required placeholder="Mobile Number" className="input mb-3" />

        {loadingCourses ? (
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse mb-3" />
        ) : (
          <select name="studentCourse" required className="input mb-3">
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c.id} value={c.title}>{c.title}</option>
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
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {passwordStrength && (
          <p className="text-xs mb-2 text-gray-500">
            Strength: {passwordStrength}
          </p>
        )}

        {/* CONFIRM */}
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
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-red-600 text-white font-medium"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <Link 
          to="/app/login"
          className="text-sm text-gray-600 text-center mt-3">
          Back to LogIn
        </Link>
        {showVerifyMsg && (
          <p className="text-xs text-green-600 text-center mt-3">
            ✅ Verification email sent
          </p>
        )}
      </form>
    </div>
  );
}
