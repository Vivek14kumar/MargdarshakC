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
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import StudentNavbar from "../../components/StudentNavbar";
import StudentBottomNav from "../../components/StudentBottomNav";

import { FileText, DownloadCloud, Eye, Check } from "lucide-react";

export default function StudentNotes() {
  const uid = auth.currentUser?.uid;

  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [downloaded, setDownloaded] = useState({});
  const [viewerPdf, setViewerPdf] = useState(null); // in-app viewer

  /* ---------------- COURSES ---------------- */
  useEffect(() => {
    if (!uid) return;

    getDoc(doc(firestore, "users", uid)).then(snap => {
      if (!snap.exists()) return;
      const enrolled = snap.data().enrolledCourses || [];
      setCourses(enrolled);
      if (enrolled.length) setActiveCourse(enrolled[0]);
    });
  }, [uid]);

  /* ---------------- NOTES ---------------- */
  useEffect(() => {
    if (!activeCourse) return;

    const q = query(
      collection(firestore, "pdfs"),
      where("courseTitle", "==", activeCourse),
      where("deleted", "==", false),
      orderBy("createdAt", "desc")
    );

    getDocs(q).then(snap =>
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [activeCourse]);

  /* ---------------- DOWNLOAD TICKS ---------------- */
  useEffect(() => {
    if (!uid) return;

    getDocs(
      collection(firestore, "users", uid, "downloadedNotes")
    ).then(snap => {
      const map = {};
      snap.forEach(d => (map[d.id] = true));
      setDownloaded(map);
    });
  }, [uid]);

  /* ---------------- VIEW PDF (IN APP, OFFLINE) ---------------- */
  const viewPdf = (note) => {
    setViewerPdf(note.url);
  };

  /* ---------------- DOWNLOAD ONLY ---------------- */
  const downloadPdf = async (note) => {
    await updateDoc(doc(firestore, "pdfs", note.id), {
      downloads: increment(1),
    });

    await setDoc(
      doc(firestore, "users", uid, "downloadedNotes", note.id),
      {
        title: note.title,
        url: note.url,
        downloadedAt: serverTimestamp(),
      }
    );

    setDownloaded(prev => ({ ...prev, [note.id]: true }));

    // real download (no open)
    const a = document.createElement("a");
    a.href = note.url;
    a.download = note.title;
    a.click();
  };

  return (
    <div className="min-h-screen pb-28 px-4 md:px-8 md:ml-[296px]">
      <StudentNavbar />

      <h1 className="text-2xl font-bold mt-6">Notes & PDFs</h1>

      {/* Course Tabs */}
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {courses.map(c => (
          <button
            key={c}
            onClick={() => setActiveCourse(c)}
            className={`px-4 py-2 rounded-full text-sm
              ${activeCourse === c
                ? "bg-red-600 text-white"
                : "bg-white border"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {notes.map(n => (
          <div
            key={n.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText />
              </div>
              <p className="font-semibold">{n.title}</p>
            </div>

            <div className="flex items-center gap-3">
              {downloaded[n.id] && <Check className="text-green-600" />}

              <button
                onClick={() => viewPdf(n)}
                className="text-blue-600 text-sm flex gap-1"
              >
                <Eye size={16} /> View
              </button>

              <button
                onClick={() => downloadPdf(n)}
                className="text-red-600 text-sm flex gap-1"
              >
                <DownloadCloud size={16} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* IN-APP PDF VIEWER */}
      {viewerPdf && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
          <button
            onClick={() => setViewerPdf(null)}
            className="text-white p-3 self-end"
          >
            Close ✕
          </button>

          <iframe
            src={viewerPdf}
            className="flex-1 bg-white"
            title="PDF Viewer"
          />
        </div>
      )}

      <StudentBottomNav />
    </div>
  );
}
