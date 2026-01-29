import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaImage,
  FaFilePdf,
  FaPoll,
  FaSignOutAlt,
  FaUsers,
  FaCloud,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function DashboardHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState({});
  const [cloudinaryUsage, setCloudinaryUsage] = useState(null);

  const [coursesCount, setCoursesCount] = useState({
    active: 0,
    archived: 0,
    total: 0,
  });

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

        // COURSES COUNT
        const activeCourses = coursesSnap.docs.filter(
          (d) => d.data().status === "active"
        );
        const archivedCourses = coursesSnap.docs.filter(
          (d) => d.data().status === "archived"
        );

        setCoursesCount({
          active: activeCourses.length,
          archived: archivedCourses.length,
          total: coursesSnap.size,
        });

        // OTHER COUNTS
        const photos = photosSnap.size;
        const notes = pdfSnap.size;
        const results = resultSnap.size;

        // COURSE ENROLLMENTS
        const enrollMap = {};
        usersSnap.forEach((u) => {
          (u.data().enrolledCourses || []).forEach((course) => {
            enrollMap[course] = (enrollMap[course] || 0) + 1;
          });
        });

        setStats({ photos, notes, results });
        setCourseEnrollments(enrollMap);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }

    async function loadCloudinaryUsage() {
      try {
        const res = await fetch("/.netlify/functions/cloudinary-usage");
        const data = await res.json();
        setCloudinaryUsage(data);
      } catch (err) {
        console.error("Cloudinary fetch error:", err);
      }
    }

    loadDashboard();
    loadCloudinaryUsage();
  }, []);

  const FREE_STORAGE_GB = 5;
  const usedGB = cloudinaryUsage?.total?.gb || 0;
  const remainingGB = Math.max(FREE_STORAGE_GB - usedGB, 0);
  const percentUsed = Math.min((usedGB / FREE_STORAGE_GB) * 100, 100);

  const formatStorage = (item) => {
    if (!item || item.bytes === 0) return "0 KB";
    if (item.gb >= 1) return `${item.gb} GB`;
    if (item.mb >= 1) return `${item.mb} MB`;
    return `${(item.bytes / 1024).toFixed(2)} KB`;
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!stats) return <DashboardSkeleton />;

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
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

      {/* CONTENT OVERVIEW */}
      <Section title="Content Overview">
        <Grid4>
          <Stat icon={<FaFilePdf />} title="Notes" value={stats.notes} />

          {/* Courses card showing active, archived, total */}
          <Stat
  icon={<FaBook />}
  title="Courses"
  value={
    <div className="text-sm text-gray-600 space-y-1">
      <div>Active - {coursesCount.active}</div>
      <div>Archived - {coursesCount.archived}</div>
      <div>Total - {coursesCount.total}</div>
    </div>
  }
/>


          <Stat icon={<FaPoll />} title="Results" value={stats.results} />
          <Stat icon={<FaImage />} title="Photos" value={stats.photos} />
        </Grid4>
      </Section>

      {cloudinaryUsage && (
        <Section title="Used Storage">
          <Grid4>
            <Stat
              icon={<FaImage />}
              title="Gallery"
              value={formatStorage(cloudinaryUsage.gallery)}
            />
            <Stat
              icon={<FaFilePdf />}
              title="Notes"
              value={formatStorage(cloudinaryUsage.pdfs)}
            />
            <Stat
              icon={<FaBook />}
              title="Results"
              value={formatStorage(cloudinaryUsage.results)}
            />
            <Stat
              icon={<FaCloud />}
              title="Total Storage"
              value={formatStorage(cloudinaryUsage.total)}
            />
          </Grid4>
        </Section>
      )}

      {cloudinaryUsage && (
        <Section title="Storage Plan">
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Free Plan</h3>
              <span className="text-sm text-gray-500">5 GB Total</span>
            </div>

            <p className="text-sm text-gray-600">
              Used <b>{usedGB.toFixed(2)} GB</b> of <b>{FREE_STORAGE_GB} GB</b>
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500
                  ${percentUsed >= 80 ? "bg-red-600" : "bg-green-600"}`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {remainingGB.toFixed(2)} GB remaining
              </span>

              {percentUsed >= 80 && (
                <span className="text-red-600 font-semibold">
                  ⚠ Storage almost full
                </span>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* COURSE ENROLLMENTS */}
      <Section title="Students Enrolled (Course Wise)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(courseEnrollments).map(([course, count]) => (
            <div
              key={course}
              className="bg-white rounded-2xl p-5 shadow
              flex items-center gap-4 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 bg-red-600 text-white rounded-xl
              flex items-center justify-center">
                <FaUsers />
              </div>
              <div>
                <p className="text-sm text-gray-500">{course}</p>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ================= REUSABLE ================= */
function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Grid4({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{children}</div>;
}

function Stat({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4 hover:shadow-xl transition">
      <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-24 bg-white rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
