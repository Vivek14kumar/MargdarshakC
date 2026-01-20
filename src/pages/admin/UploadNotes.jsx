// src/pages/admin/UploadNotes.jsx
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

export default function UploadNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  /* PAGINATION */
  const PAGE_SIZE = 5;
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /* ===============================
     FETCH COURSES
  =============================== */
  useEffect(() => {
    const fetchCourses = async () => {
      const snap = await getDocs(collection(firestore, "courses"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCourses(list);
    };
    fetchCourses();
  }, []);

  /* ===============================
     REAL-TIME + PAGINATED PDFs
  =============================== */
  useEffect(() => {
    if (!selectedCourse) return;

    const q = query(
      collection(firestore, "pdfs"),
      where("courseTitle", "==", selectedCourse),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPdfs(list);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    });

    return () => unsub();
  }, [selectedCourse]);

  /* ===============================
     LOAD MORE (PAGINATION)
  =============================== */
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    const q = query(
      collection(firestore, "pdfs"),
      where("courseTitle", "==", selectedCourse),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);

    const more = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setPdfs((prev) => [...prev, ...more]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === PAGE_SIZE);
  };

  /* ===============================
     NOTIFY STUDENTS (FRONTEND VERSION)
  =============================== */
  const notifyStudents = async (noteTitle) => {
  const usersSnap = await getDocs(
    query(collection(firestore, "users"), where("role", "==", "student"))
  );

  const promises = [];

  usersSnap.forEach((user) => {
    promises.push(
      addDoc(collection(firestore, "notifications"), {
        uid: user.id,
        type: "notes",
        title: "New Notes Uploaded",
        message: `${noteTitle} notes are now available`,
        courseTitle: selectedCourse, // ✅ STRING
        read: false,
        createdAt: serverTimestamp(),
      })
    );
  });

  await Promise.all(promises);
};


  
  /* ===============================
     UPLOAD PDF
  =============================== */
  const submit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Select a course");

    const file = e.target.pdfFile.files[0];
    const title = e.target.title.value;

    if (!file) return alert("Select PDF");

    setLoading(true);
    setProgress(0);

    try {
      const sigRes = await fetch(
        `http://localhost:5000/api/pdf/sign?folder=pdfs/${selectedCourse}`
      );
      const sig = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `pdfs/${selectedCourse}`);
      formData.append("resource_type", "raw");
      formData.append("api_key", sig.api_key);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = async () => {
        const res = JSON.parse(xhr.responseText);
        if (!res.public_id) throw new Error("Upload failed");

        // 1️⃣ Add PDF to Firestore
        await addDoc(collection(firestore, "pdfs"), {
          title,
          url: res.secure_url,
          publicId: res.public_id,
          courseTitle: selectedCourse,
          downloads: 0,
          deleted: false,
          createdAt: new Date(),
        });

        // 2️⃣ Notify all students
        await notifyStudents(title);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        setProgress(0);
        e.target.reset();
      };

      xhr.onerror = () => {
        alert("Upload error");
        setLoading(false);
        setProgress(0);
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload failed:", err);
      setLoading(false);
      setProgress(0);
    }
  };

  /* ===============================
     DELETE PDF
  =============================== */
  const removePDF = async (pdf) => {
    if (!window.confirm("Delete this PDF?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/pdf/${pdf.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ===============================
     DOWNLOAD COUNTER
  =============================== */
  const incrementDownload = async (pdfId) => {
    try {
      await updateDoc(doc(firestore, "pdfs", pdfId), {
        downloads: increment(1),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* SELECT COURSE */}
      <div className="bg-white p-4 rounded-xl shadow">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.title}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* UPLOAD FORM */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Study Notes</h2>

        {success && (
          <p className="text-green-600 text-sm mb-3 text-center">
            ✅ PDF uploaded successfully
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            name="title"
            required
            placeholder="PDF title"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="file"
            name="pdfFile"
            accept="application/pdf"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>

          {progress > 0 && (
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>
      </div>

      {/* PDF LIST */}
      <div className="bg-white shadow rounded p-6">
        {pdfs.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No PDFs uploaded for this course
          </p>
        ) : (
          <>
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex justify-between items-center border p-3 rounded mb-2"
              >
                <div>
                  <p className="font-medium">{pdf.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(
                      pdf.createdAt?.seconds
                        ? pdf.createdAt.seconds * 1000
                        : pdf.createdAt
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Downloads: {pdf.downloads || 0}
                  </p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementDownload(pdf.id)}
                    className="text-blue-600 underline"
                  >
                    Preview / Download
                  </a>

                  <button
                    onClick={() => removePDF(pdf)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full mt-3 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
