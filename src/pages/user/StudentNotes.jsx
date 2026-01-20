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
import StudentBottomNav from "../../components/StudentBottomNav";
import StudentNavbar from "../../components/StudentNavbar";
import { FileText, DownloadCloud, Check } from "lucide-react";

export default function StudentNotes() {
  const uid = auth.currentUser?.uid;

  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [downloads, setDownloads] = useState({}); // Track downloaded PDFs

  /* ---------------- FETCH ENROLLED COURSES ---------------- */
  useEffect(() => {
    if (!uid) return;

    const fetchCourses = async () => {
      const snap = await getDoc(doc(firestore, "users", uid));
      if (!snap.exists()) return;

      const enrolled = snap.data().enrolledCourses || [];
      setCourses(enrolled);
      if (enrolled.length) setActiveCourse(enrolled[0]);
    };

    fetchCourses();
  }, [uid]);

  /* ---------------- FETCH NOTES COURSE-WISE ---------------- */
  useEffect(() => {
    if (!activeCourse) return;

    const fetchNotes = async () => {
      const q = query(
        collection(firestore, "pdfs"),
        where("courseTitle", "==", activeCourse),
        where("deleted", "==", false),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setNotes(list);
    };

    fetchNotes();
  }, [activeCourse]);

  /* ---------------- HANDLE PDF CLICK + DOWNLOAD COUNT ---------------- */
  const handleDownload = async (note) => {
    const pdfRef = doc(firestore, "pdfs", note.id);
    await updateDoc(pdfRef, { downloads: increment(1) });

    // Mark as downloaded locally
    setDownloads((prev) => ({ ...prev, [note.id]: true }));

    // Open PDF in new tab
    window.open(note.url, "_blank");
  };

  return (
    <div className="min-h-screen  pb-28 px-4 md:px-8 md:ml-[296px]">
  <StudentNavbar />

  <h1 className="text-2xl md:text-3xl font-bold  mt-6">
    Notes & PDFs
  </h1>

  {/* Course Tabs */}
  <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
    {courses.map((c) => (
      <button
        key={c}
        onClick={() => setActiveCourse(c)}
        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition mb-4
          ${activeCourse === c
            ? "bg-red-600 text-white shadow-lg"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-red-50"
          }`}
      >
        {c}
      </button>
    ))}
  </div>

  {/* Notes Grid */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    {notes.map((n) => (
      <div
        key={n.id}
        className="bg-white rounded-xl shadow p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
      >
        <div className="flex items-center gap-3" onClick={() => handleDownload(n)}>
          <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">{n.title}</p>
            <p className="text-xs text-gray-500">
              Downloads: {n.downloads || 0}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {downloads[n.id] && <Check size={18} className="text-green-600" />}
          <button
            onClick={() => handleDownload(n)}
            className="flex items-center gap-1 text-red-600 font-semibold text-sm hover:underline"
          >
            <DownloadCloud size={16} />
            Download
          </button>
        </div>
      </div>
    ))}
  </div>

  <StudentBottomNav />
</div>

  );
}
