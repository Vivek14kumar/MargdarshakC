import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import {FaFilePdf, FaSpinner } from "react-icons/fa";

const PAGE_SIZE = 5;

export default function UploadResults() {
  const [activeTab, setActiveTab] = useState("rank");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");

  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  /*--------------DATE & TIME---------------------*/
  const dateTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  /* ---------------- FETCH COURSES ---------------- */
  useEffect(() => {
    getDocs(collection(firestore, "courses")).then((snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ---------------- REALTIME RESULTS ---------------- */
  useEffect(() => {
    if (!selectedCourse) {
      setResults([]);
      return;
    }

    const q = query(
      collection(firestore, "results"),
      where("courseTitle", "==", selectedCourse),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResults(list);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    });

    return () => unsub();
  }, [selectedCourse]);

  /* ---------------- LOAD MORE ---------------- */
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    const q = query(
      collection(firestore, "results"),
      where("courseTitle", "==", selectedCourse),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);
    setResults((prev) => [
      ...prev,
      ...snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === PAGE_SIZE);
  };

  /* ---------------- NOTIFY STUDENTS ---------------- */
  const notifyStudents = async (msg) => {
    const usersSnap = await getDocs(
      query(
        collection(firestore, "users"),
        where("role", "==", "student"),
        where("enrolledCourses", "array-contains", selectedCourse)
      )
    );

    await Promise.all(
      usersSnap.docs.map((u) =>
        addDoc(collection(firestore, "notifications"), {
          uid: u.id,
          type: "result",
          title: "Result Published",
          message: msg,
          courseTitle: selectedCourse,
          read: false,
          createdAt: serverTimestamp(),
        })
      )
    );
  };

  /* ---------------- TOP 3 RESULT ---------------- */
  const submitRank = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Select course");

    setLoading(true);
    try {
      const data = {
        courseTitle: selectedCourse,
        rank: e.target.rank.value,
        studentName: e.target.studentName.value,
        marks: Number(e.target.marks.value),
        type: "rank",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, "results"), data);
      await notifyStudents(`🏆 ${data.rank} Rank ${data.studentName}`);

      setSuccess(true);
      e.target.reset();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PDF RESULT ---------------- */
  const submitPDF = async (e) => {
  e.preventDefault();
  if (!selectedCourse) return alert("Select course");

  const file = e.target.pdf.files[0];
  if (!file) return alert("Select a PDF file");

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  // ✅ Check file size
  if (file.size > MAX_SIZE) {
    alert(
      "⚠ PDF is too large!\n\n" +
      "Maximum allowed size is 10 MB.\n\n" +
      "Tips for uploading large PDFs:\n" +
      "- Split the PDF into smaller parts (per chapter)\n" +
      "- Compress images inside the PDF\n" +
      "- Use online compressors like SmallPDF or ILovePDF"
    );
    return;
  }

  setLoading(true);
  setProgress(0);

  try {
    const signRes = await fetch("/.netlify/functions/sign?folder=results");
    const sign = await signRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.api_key);
    formData.append("timestamp", sign.timestamp);
    formData.append("signature", sign.signature);
    formData.append("folder", "results");
    formData.append("resource_type", "raw");

    const upload = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sign.cloud_name}/raw/upload`
      );
      xhr.upload.onprogress = (e) =>
        e.lengthComputable &&
        setProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () =>
        xhr.status === 200
          ? resolve(JSON.parse(xhr.response))
          : reject();
      xhr.onerror = reject;
      xhr.send(formData);
    });

    await addDoc(collection(firestore, "results"), {
      courseTitle: selectedCourse,
      title: e.target.title.value,
      url: upload.secure_url,
      publicId: upload.public_id,
      type: "pdf",
      createdAt: serverTimestamp(),
    });

    await notifyStudents(`${e.target.title.value} Result Published on ${dateTime}`);

    setSuccess(true);
    e.target.reset();
    setProgress(0);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed");
  } finally {
    setLoading(false);
  }
};


  /* ---------------- DELETE ---------------- */
  const deleteResult = async (r) => {
    if (!confirm("Delete result?")) return;

    setDeletingId(r.id);

    try {
      if (r.type === "pdf") {
        await fetch("/.netlify/functions/delete-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultId: r.id }),
        });
      } else {
        await deleteDoc(doc(firestore, "results", r.id));
      }

      // UX delay
      await new Promise((res) => setTimeout(res, 5000));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filtered = results.filter((r) =>
    (r.studentName || r.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* COURSE SELECT */}
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full border rounded-xl p-3 bg-white"
      >
        <option value="">-- Select Course --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.title}>
            {c.title}
          </option>
        ))}
      </select>

      {/* UPLOAD CARD */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex mb-4 rounded-xl overflow-hidden border">
          {["rank", "pdf"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 font-semibold transition ${
                activeTab === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {t === "rank" ? "Top 3 Results" : "Upload PDF"}
            </button>
          ))}
        </div>

        {success && (
          <p className="text-green-600 mb-3">✅ Saved successfully</p>
        )}

        {activeTab === "rank" && (
          <form onSubmit={submitRank} className="space-y-3">
            <select name="rank" required className="w-full border p-2 rounded">
              <option value="">Select Rank</option>
              <option>1st</option>
              <option>2nd</option>
              <option>3rd</option>
            </select>
            <input
              name="studentName"
              placeholder="Student Name"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="marks"
              type="number"
              placeholder="Marks"
              required
              className="w-full border p-2 rounded"
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              {loading ? "Saving..." : "Save Result"}
            </button>
          </form>
        )}

        {activeTab === "pdf" && (
          <form onSubmit={submitPDF} className="space-y-3">
            <input
              name="title"
              placeholder="PDF Title"
              required
              className="w-full border p-2 rounded"
            />
            <input type="file" name="pdf" accept="application/pdf" required />
            {progress > 0 && (
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
            <button className="w-full bg-blue-600 text-white py-2 rounded-xl">
              Upload PDF
            </button>
          </form>
        )}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded-xl"
      />

      {/* RESULTS LIST */}
      {filtered.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-2xl shadow-sm border p-4 flex justify-between items-center hover:shadow-md transition"
        >
          <div className="space-y-1">
            {r.type === "rank" ? (
              <p className="font-semibold">
                🏆 {r.rank} – {r.studentName}
                <span className="text-sm text-gray-500 ml-2">
                  ({r.marks})
                </span>
              </p>
            ) : (
              <>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-gray-500">
                    Views: {r.views || 0}
                  </p>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 text-sm"
            >
              <FaFilePdf className="text-red-600" /> Open
            </a>

            <button
              onClick={() => deleteResult(r)}
              disabled={deletingId === r.id}
              className="flex items-center gap-2 text-red-600 text-sm"
            >
              {deletingId === r.id ? (
                <>
                  <FaSpinner className="animate-spin" /> Deleting…
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
          className="w-full border py-2 rounded-xl"
        >
          Load More
        </button>
      )}
    </div>
  );
}
