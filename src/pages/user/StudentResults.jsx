import { useEffect, useState } from "react";
import { auth, firestore } from "../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore";

import { FileText, X } from "lucide-react";

import StudentBottomNav from "../../components/StudentBottomNav";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentResults() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewerPdf, setViewerPdf] = useState(null); // 👈 in-app viewer

  /* ---------------- FETCH ENROLLED COURSES ---------------- */
  useEffect(() => {
    const fetchUserCourses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(firestore, "users", user.uid));
      if (snap.exists()) {
        const courses = snap.data().enrolledCourses || [];
        setEnrolledCourses(courses);
        if (courses.length > 0) setActiveCourse(courses[0]);
      }
    };
    fetchUserCourses();
  }, []);

  /* ---------------- FETCH RESULTS COURSE-WISE ---------------- */
  useEffect(() => {
    if (!activeCourse) return;

    const fetchResults = async () => {
      setLoading(true);

      const q = query(
        collection(firestore, "results"),
        where("courseTitle", "==", activeCourse),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchResults();
  }, [activeCourse]);

  /* ---------------- OPEN RESULT IN APP ---------------- */
  const openResultPDF = async (result) => {
    try {
      await updateDoc(doc(firestore, "results", result.id), {
        views: increment(1),
      });

      setViewerPdf(result.url); // 👈 open inside app
    } catch (err) {
      console.error("Failed to update view count", err);
    }
  };

  return (
    <div className="min-h-screen md:flex">
      {/* DESKTOP NAV */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-[296px]">
        <StudentNavbar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-[296px] pb-28 px-4 md:px-8 pt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-red-700">
          Results
        </h1>

        {/* COURSE TABS */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {enrolledCourses.map(course => (
            <button
              key={course}
              onClick={() => setActiveCourse(course)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition
                ${
                  activeCourse === course
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-red-50"
                }`}
            >
              {course}
            </button>
          ))}
        </div>

        {/* RESULTS GRID */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ResultSkeleton key={i} />
            ))
          ) : results.length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center mt-4">
              No results available for this course
            </p>
          ) : (
            results.map(r => (
              <ResultCard
                key={r.id}
                result={r}
                openResultPDF={openResultPDF}
              />
            ))
          )}
        </div>

        {/* MOBILE NAV */}
        <div className="md:hidden">
          <StudentBottomNav />
        </div>
      </div>

      {/* ================= IN-APP PDF VIEWER ================= */}
      {viewerPdf && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex justify-end p-3">
            <button
              onClick={() => setViewerPdf(null)}
              className="text-white flex items-center gap-1"
            >
              <X size={20} /> Close
            </button>
          </div>

          <iframe
            src={viewerPdf}
            title="Result PDF"
            className="flex-1 bg-white"
          />
        </div>
      )}
    </div>
  );
}

/* ================= RESULT CARD ================= */
function ResultCard({ result, openResultPDF }) {
  const formatDate = (ts) => {
    if (!ts?.seconds) return "";
    const d = new Date(ts.seconds * 1000);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg p-5 transition flex flex-col gap-2">
      {result.type === "rank" ? (
        <>
          <p className="font-semibold">{result.studentName}</p>
          <p className="text-sm text-gray-600">
            Rank: <span className="font-bold">{result.rank}</span>
          </p>
          <p className="text-sm text-green-600 font-bold">
            Marks: {result.marks}
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold flex items-center gap-2">
            <FileText size={18} />
            {result.title}
          </p>

          <button
            onClick={() => openResultPDF(result)}
            className="text-sm text-blue-600 underline w-fit"
          >
            View Result PDF
          </button>
        </>
      )}

      <p className="text-xs text-gray-400">
        Date: {formatDate(result.createdAt)}
      </p>
    </div>
  );
}

/* ================= SKELETON ================= */
function ResultSkeleton() {
  return (
    <div className="bg-white h-28 rounded-2xl animate-pulse" />
  );
}
