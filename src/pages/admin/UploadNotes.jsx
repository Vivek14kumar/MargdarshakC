import { useEffect, useState } from "react";
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
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function UploadNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* PAGINATION */
  const PAGE_SIZE = 5;
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /* 🔥 FORCE SNAPSHOT REFRESH */
  const [refreshKey, setRefreshKey] = useState(0);

  const resetPagination = () => {
    setPdfs([]);
    setLastDoc(null);
    setHasMore(true);
    setRefreshKey((k) => k + 1); // 🔥 critical
  };

  /* ===============================
     FETCH ACTIVE COURSES
  =============================== */
  useEffect(() => {
    const fetchCourses = async () => {
      const q = query(
        collection(firestore, "courses"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      setCourses(
        snap.docs.map((d) => ({
          id: d.id,
          courseId: d.data().courseId,
          title: d.data().title,
        }))
      );
    };

    fetchCourses();
  }, []);

  /* ===============================
     REALTIME PDFs (PAGE 1)
  =============================== */
  useEffect(() => {
    if (!selectedCourse) return;

    const q = query(
      collection(firestore, "pdfs"),
      where("courseId", "==", selectedCourse.courseId),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPdfs(list);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    });

    return () => unsub();
  }, [selectedCourse, refreshKey]);

  /* ===============================
     LOAD MORE (PAGE 2+)
  =============================== */
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    const q = query(
      collection(firestore, "pdfs"),
      where("courseId", "==", selectedCourse.courseId),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);

    setPdfs((prev) => [
      ...prev,
      ...snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ]);

    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === PAGE_SIZE);
  };

  /* ===============================
     NOTIFY STUDENTS
  =============================== */
  const notifyStudents = async (noteTitle) => {
    const usersSnap = await getDocs(
      query(collection(firestore, "users"), where("role", "==", "student"))
    );

    const jobs = [];

    usersSnap.forEach((u) => {
      jobs.push(
        addDoc(collection(firestore, "notifications"), {
          uid: u.id,
          type: "notes",
          title: "New Notes Uploaded",
          message: `${noteTitle} notes are now available`,
          courseId: selectedCourse.courseId,
          courseTitle: selectedCourse.title,
          read: false,
          createdAt: serverTimestamp(),
        })
      );
    });

    await Promise.all(jobs);
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

    if (file.size > 10 * 1024 * 1024) {
      alert("Max PDF size is 10MB");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const sigRes = await fetch(
        `/.netlify/functions/sign?folder=pdfs/${selectedCourse.courseId}`
      );
      const sig = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `pdfs/${selectedCourse.courseId}`);
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

        await addDoc(collection(firestore, "pdfs"), {
          title,
          url: res.secure_url,
          publicId: res.public_id,
          courseId: selectedCourse.courseId,
          courseTitle: selectedCourse.title,
          downloads: 0,
          deleted: false,
          createdAt: serverTimestamp(),
        });

        await notifyStudents(title);
        resetPagination();

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        setProgress(0);
        e.target.reset();
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  /* ===============================
     DELETE PDF
  =============================== */
  const removePDF = async (pdf) => {
    if (!window.confirm("Delete this PDF permanently?")) return;
    setDeletingId(pdf.id);

    try {
      await fetch("/.netlify/functions/delete-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId: pdf.id,
          publicId: pdf.publicId,
          resourceType: "raw",
        }),
      });

      resetPagination();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <select
        value={selectedCourse?.courseId || ""}
        onChange={(e) =>
          setSelectedCourse(
            courses.find((c) => c.courseId === e.target.value)
          )
        }
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">-- Select Course --</option>
        {courses.map((c) => (
          <option key={c.courseId} value={c.courseId}>
            {c.title}
          </option>
        ))}
      </select>

      <div className="bg-white p-6 rounded shadow">
        {success && (
          <p className="text-green-600 text-center mb-2">
            ✅ PDF uploaded successfully
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            name="title"
            placeholder="PDF title"
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input type="file" name="pdfFile" accept="application/pdf" required />
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>

          {progress > 0 && (
            <div className="bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="border p-3 rounded mb-2 flex justify-between"
          >
            <div>
              <p className="font-semibold">{pdf.title}</p>
              <p className="text-xs text-gray-500">
                Downloads: {pdf.downloads || 0}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={pdf.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 flex items-center gap-1"
              >
                <FaFilePdf /> Open
              </a>

              <button
                onClick={() => removePDF(pdf)}
                disabled={deletingId === pdf.id}
                className="text-red-600"
              >
                {deletingId === pdf.id ? (
                  <span className="animate-spin">
                    <FaSpinner />
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full border py-2 rounded text-blue-600"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
