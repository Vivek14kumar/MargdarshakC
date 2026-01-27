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
import {FaFilePdf, FaSpinner} from "react-icons/fa";

export default function UploadNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

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
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPdfs(list);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    });

    return () => unsub();
  }, [selectedCourse]);

  /* ===============================
     LOAD MORE
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
          courseTitle: selectedCourse,
          read: false,
          createdAt: serverTimestamp(),
        })
      );
    });

    await Promise.all(jobs);
  };

  /* ===============================
   UPLOAD PDF (SERVERLESS) WITH SIZE LIMIT
=============================== */
const submit = async (e) => {
  e.preventDefault();
  if (!selectedCourse) return alert("Select a course");

  const file = e.target.pdfFile.files[0];
  const title = e.target.title.value;

  if (!file) return alert("Select PDF");

  // ✅ Check file size (10 MB = 10 * 1024 * 1024 bytes)
  const MAX_SIZE = 10 * 1024 * 1024; 
  if (file.size > MAX_SIZE) {
    alert(
      "PDF is too large! Maximum allowed size is 10 MB.\n\nTips:\n" +
      "- Split the PDF into smaller parts (per chapter)\n" +
      "- Compress images inside the PDF\n" +
      "- Use online PDF compressors like SmallPDF or ILovePDF"
    );
    return;
  }

  setLoading(true);
  setProgress(0);

  try {
    // 1️⃣ Get Cloudinary signature
    const sigRes = await fetch(
      `/.netlify/functions/sign?folder=pdfs/${selectedCourse}`
    );
    const sig = await sigRes.json();

    // 2️⃣ Upload to Cloudinary
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

      // 3️⃣ Save PDF in Firestore
      await addDoc(collection(firestore, "pdfs"), {
        title,
        url: res.secure_url,
        publicId: res.public_id,
        courseTitle: selectedCourse,
        downloads: 0,
        deleted: false,
        createdAt: serverTimestamp(),
      });

      // 4️⃣ Notify students
      await notifyStudents(title);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setLoading(false);
      setProgress(0);
      e.target.reset();
    };

    xhr.onerror = () => {
      alert("Upload failed");
      setLoading(false);
    };

    xhr.send(formData);
  } catch (err) {
    console.error("Upload error:", err);
    setLoading(false);
  }
};


  /* ===============================
     DELETE PDF (SERVERLESS)
  =============================== */
const removePDF = async (pdf) => {
  if (!window.confirm("Delete this PDF permanently?")) return;

  setDeletingId(pdf.id); // 🔄 start loading

  try {
    const res = await fetch("/.netlify/functions/delete-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        pdfId: pdf.id,
        publicId: pdf.publicId,
        resourceType: pdf.resourceType || "raw",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Delete failed");
    }

    console.log("Deleted:", pdf.title);
    // ✅ Firestore onSnapshot will auto-remove from UI
  } catch (err) {
    console.error(err);
    alert("Delete failed. Please try again.");
  } finally {
    setDeletingId(null); // 🔄 stop loading
  }
};



  /* ===============================
     DOWNLOAD COUNTER
  =============================== */
  const incrementDownload = async (pdfId) => {
    await updateDoc(doc(firestore, "pdfs", pdfId), {
      downloads: increment(1),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* SELECT COURSE */}
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">-- Select Course --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.title}>
            {c.title}
          </option>
        ))}
      </select>

      {/* UPLOAD FORM */}
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

      {/* PDF LIST */}
      <div className="bg-white p-6 rounded shadow">
        {pdfs.length === 0 ? (
          <p className="text-center text-gray-500">No PDFs found</p>
        ) : (
          <>
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
                    onClick={() => incrementDownload(pdf.id)}
                    className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline"
                  >
                    <FaFilePdf className="text-blue-600 text-base" />
                    <span>Open</span>
                  </a>

                  <button
                    onClick={() => removePDF(pdf)}
                    disabled={deletingId === pdf.id}
                    className={`text-red-600 flex items-center gap-2 ${
                      deletingId === pdf.id ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {deletingId === pdf.id ? (
                      <>
                        <span className="animate-spin"><FaSpinner/></span>
                        Deleting...
                      </>
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
          </>
        )}
      </div>
    </div>
  );
}
