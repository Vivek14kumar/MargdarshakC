import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaImage,
  FaFilePdf,
  FaPoll,
  FaEye,
  FaDownload,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState({});

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          coursesSnap,
          photosSnap,
          pdfSnap,
          resultSnap,
          usersSnap,
        ] = await Promise.all([
          getDocs(collection(firestore, "courses")),
          getDocs(collection(firestore, "photos")),
          getDocs(collection(firestore, "pdfs")),
          getDocs(collection(firestore, "results")),
          getDocs(collection(firestore, "users")),
        ]);

        // ---- COUNTS ----
        const courses = coursesSnap.size;
        const photos = photosSnap.size;
        const notes = pdfSnap.size;
        const results = resultSnap.size;

        // ---- NOTES DOWNLOADS ONLY ----
        let pdfDownloads = 0;
        pdfSnap.forEach(d => {
          pdfDownloads += d.data().downloads || 0;
        });

        // ---- RESULT VIEWS ONLY ----
        let resultViews = 0;
        resultSnap.forEach(d => {
          resultViews += d.data().views || 0;
        });

        // ---- COURSE-WISE ENROLLMENTS ----
        const enrollMap = {};
        usersSnap.forEach(u => {
          const enrolled = u.data().enrolledCourses || [];
          enrolled.forEach(course => {
            enrollMap[course] = (enrollMap[course] || 0) + 1;
          });
        });

        setStats({
          courses,
          photos,
          notes,
          results,
          pdfDownloads,
          resultViews,
        });

        setCourseEnrollments(enrollMap);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }

    loadDashboard();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!stats) return <DashboardSkeleton />;

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 text-white
            px-4 py-2 rounded-xl shadow hover:brightness-110 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* ================= ROW 1 ================= */}
      <Section title="Content Overview">
        <Grid4>
          <Stat icon={<FaFilePdf />} title="Notes" value={stats.notes} />
          <Stat icon={<FaBook />} title="Courses" value={stats.courses} />
          <Stat icon={<FaPoll />} title="Results" value={stats.results} />
          <Stat icon={<FaImage />} title="Photos" value={stats.photos} />
        </Grid4>
      </Section>

      {/* ================= ROW 2 ================= 
      <Section title="Engagement">
        <Grid4>
          <Stat
            icon={<FaDownload />}
            title="Notes Downloads"
            value={stats.pdfDownloads}
          />
          <Stat
            icon={<FaEye />}
            title="Result PDF Views"
            value={stats.resultViews}
          />
        </Grid4>
      </Section>
        */}
      {/* ================= ROW 3 ================= */}
      <Section title="Students Enrolled (Course Wise)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(courseEnrollments).map(([course, count]) => (
            <div
              key={course}
              className="bg-white rounded-2xl p-5 shadow
                flex items-center gap-4 hover:shadow-lg transition"
            >
              <div
                className="w-12 h-12 bg-red-600 text-white
                  rounded-xl flex items-center justify-center"
              >
                <FaUsers />
              </div>
              <div>
                <p className="text-sm text-gray-500">{course}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ===================== */
/* REUSABLE COMPONENTS */
/* ===================== */

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid4({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

function Stat({ icon, title, value }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow
        flex items-center gap-4 hover:shadow-xl transition"
    >
      <div
        className="w-12 h-12 rounded-xl bg-red-600 text-white
          flex items-center justify-center text-xl"
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(j => (
            <div key={j} className="h-24 bg-white rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
