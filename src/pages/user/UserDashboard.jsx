import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  BarChart2,
  User,
  LogOut,
} from "lucide-react";

import StudentBottomNav from "../../components/StudentBottomNav";
import StudentNotifications from "../../components/StudentNotifications";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch user data
      const snap = await getDoc(doc(firestore, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        // Fetch course titles for enrolled courses
        if (data.enrolledCourses?.length) {
          const coursesRef = collection(firestore, "courses");
          const q = query(coursesRef, where("courseId", "in", data.enrolledCourses));
          const courseSnap = await getDocs(q);
          const courseList = courseSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setEnrolledCourses(courseList);
        }
      }
    });

    return () => unsub();
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!userData) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* ===== MODERN HEADER ===== */}
      <div className="relative bg-[#0f172a] pb-32">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ef444430,transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-4 pt-6 text-white">
          <div className="flex items-center justify-between">
            {/* Student Info */}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-300">
                Student Dashboard
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                Hi, {userData.name}
              </h1>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-xl
              bg-white/10 hover:bg-white/20 transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* ===== FLOATING INFO CARD ===== */}
        <div className="absolute left-0 right-0 -bottom-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div
              className="bg-white rounded-3xl shadow-2xl p-5
              flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* Left: Institute Info */}
              <div className="flex items-center gap-3 order-1 sm:order-1">
                <img
                  src="/logo.png"
                  alt="Institute Logo"
                  className="w-12 h-12 rounded-xl object-contain border"
                />
                <div>
                  <p className="text-[16px] font-semibold text-red-600">
                    Margdarshak Career Institute
                  </p>
                  <p className="text-xs text-gray-500">
                    Student Portal
                  </p>
                </div>
              </div>

              {/* Right: Enrolled Courses */}
              <div className="order-2 sm:order-2">
                <p className="text-xs text-gray-500">Enrolled Course</p>
                {enrolledCourses.length > 0 ? (
                  <>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {enrolledCourses[0].title}
                    </h2>
                    <span className="text-xs text-gray-400 font-bold">
                      {enrolledCourses[0].batchYear}
                    </span>
                  </>
                ) : (
                  <h2 className="text-sm font-semibold text-gray-900">
                    No course enrolled
                  </h2>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 mt-24 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 grid sm:grid-cols-2 gap-4">
          <Info label="Email" value={userData.email} />
          <Info label="Mobile" value={userData.mobile} />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DashCard
            icon={<BookOpen />}
            title="My Course"
            subtitle="Syllabus & batches"
            onClick={() => navigate("/student/courses")}
          />
          <DashCard
            icon={<FileText />}
            title="Notes"
            subtitle="PDFs & materials"
            onClick={() => navigate("/student/notes")}
          />
          <DashCard
            icon={<BarChart2 />}
            title="Results"
            subtitle="Scores & ranks"
            onClick={() => navigate("/student/results")}
          />
          <DashCard
            icon={<User />}
            title="Profile"
            subtitle="Update details"
            onClick={() => navigate("/student/profile")}
          />
        </div>

        {/* Notifications */}
        <StudentNotifications />
      </div>

      {/* Bottom Nav */}
      <StudentBottomNav />
    </div>
  );
}

/* ================= COMPONENTS ================= */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function DashCard({ icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md p-5 cursor-pointer
      hover:shadow-xl hover:-translate-y-1 transition active:scale-95"
    >
      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

/* ================= SKELETON ================= */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 animate-pulse">
      <div className="h-40 bg-red-700 rounded-b-[3rem]" />
      <div className="max-w-6xl mx-auto px-4 -mt-20 space-y-6">
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
