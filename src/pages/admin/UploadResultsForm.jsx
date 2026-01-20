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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PAGE_SIZE = 5;

export default function UploadResults() {
  const [activeTab, setActiveTab] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");

  /* PAGINATION */
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /* ---------------- FETCH COURSES ---------------- */
  useEffect(() => {
    const fetchCourses = async () => {
      const snap = await getDocs(collection(firestore, "courses"));
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchCourses();
  }, []);

  
  /* ---------------- REALTIME + PAGINATION ---------------- */
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
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

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

    const more = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setResults((prev) => [...prev, ...more]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === PAGE_SIZE);
  };

  /* ---------------- NOTIFY STUDENTS ---------------- */
  const notifyStudents = async (messageText) => {
  if (!selectedCourse) return;

  const usersSnap = await getDocs(
    query(
      collection(firestore, "users"),
      where("role", "==", "student"),
      where("enrolledCourses", "array-contains", selectedCourse)
    )
  );

  console.log("Students found:", usersSnap.docs.length);

  const promises = usersSnap.docs.map((user) =>
    addDoc(collection(firestore, "notifications"), {
      uid: user.id, // 👈 USER DOCUMENT ID
      type: "result",
      title: "Result Published",
      message: messageText,
      courseTitle: selectedCourse,
      read: false,
      createdAt: serverTimestamp(),
    })
  );

  await Promise.all(promises);
};


  /* ---------------- MANUAL RESULT ---------------- */
  const submitManual = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Please select a course");

    setLoading(true);
    setSuccess(false);

    try {
      const data = {
        courseTitle: selectedCourse,
        studentName: e.target.studentName.value,
        subject: e.target.subject.value,
        marks: Number(e.target.marks.value),
        type: "manual",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, "results"), data);

      // ✅ Notify students
      await notifyStudents(
        `${data.studentName} - ${data.subject} marks added`
      );

      setSuccess(true);
      e.target.reset();
    } catch (err) {
      alert("Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PDF RESULT ---------------- */
  const submitPDF = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Please select a course");

    setLoading(true);
    setProgress(0);
    setSuccess(false);

    const file = e.target.pdf.files[0];

    try {
      const signRes = await fetch(
        `${BASE_URL}/api/cloudinary/sign?folder=results`
      );
      const sign = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sign.api_key);
      formData.append("timestamp", sign.timestamp);
      formData.append("signature", sign.signature);
      formData.append("folder", "results");

      const uploadData = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${sign.cloud_name}/raw/upload`
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () =>
          xhr.status === 200
            ? resolve(JSON.parse(xhr.response))
            : reject("Upload failed");

        xhr.onerror = () => reject("Upload error");
        xhr.send(formData);
      });

      const docRef = await addDoc(collection(firestore, "results"), {
        courseTitle: selectedCourse,
        title: e.target.title.value,
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        type: "pdf",
        createdAt: serverTimestamp(),
      });

      // ✅ Notify students
      await notifyStudents(`New PDF result uploaded: ${e.target.title.value}`);

      setSuccess(true);
      e.target.reset();
      setProgress(0);
    } catch {
      alert("PDF upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE RESULT ---------------- */
  const deleteResult = async (r) => {
    if (!confirm("Delete this result?")) return;

    try {
      if (r.type === "pdf") {
        await fetch(`${BASE_URL}/api/results/${r.id}`, { method: "DELETE" });
      } else {
        await deleteDoc(doc(firestore, "results", r.id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredResults = results.filter((r) => {
    const q = search.toLowerCase();
    return r.type === "manual"
      ? r.studentName?.toLowerCase().includes(q) ||
          r.subject?.toLowerCase().includes(q)
      : r.title?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* SELECT COURSE */}
      <div className="bg-white p-4 rounded-xl shadow">
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
      </div>

      {/* UPLOAD CARD */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Upload Results</h2>

        <div className="flex bg-gray-100 rounded p-1 mb-4">
          {["manual", "pdf"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded ${
                activeTab === tab
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab === "manual" ? "Manual Entry" : "Upload PDF"}
            </button>
          ))}
        </div>

        {success && (
          <p className="text-green-600 text-sm mb-3">
            ✅ Result saved successfully
          </p>
        )}

        {activeTab === "manual" && (
          <form onSubmit={submitManual} className="space-y-3">
            <Input label="Student Name" name="studentName" />
            <Input label="Subject" name="subject" />
            <Input label="Marks" name="marks" type="number" />
            <SubmitBtn loading={loading} text="Add Result" />
          </form>
        )}

        {activeTab === "pdf" && (
          <form onSubmit={submitPDF} className="space-y-3">
            <Input label="PDF Title" name="title" />
            <input type="file" name="pdf" required />

            {progress > 0 && (
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <SubmitBtn loading={loading} text="Upload PDF" />
          </form>
        )}
      </div>

      {/* RESULTS LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">Results</h3>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />

        {filteredResults.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No results found.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {filteredResults.map((r) => (
                <li
                  key={r.id}
                  className="border rounded-xl p-4 flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {r.type === "manual"
                        ? `${r.studentName} - ${r.subject}`
                        : r.title}
                    </p>
                    {r.type === "manual" && (
                      <p className="text-sm text-gray-500">Marks: {r.marks}</p>
                    )}
                    {r.type === "pdf" && (
                      <a
                        href={r.url}
                        target="_blank"
                        className="text-blue-600 text-sm underline"
                      >
                        View PDF
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => deleteResult(r)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full mt-4 border border-blue-600 text-blue-600 py-2 rounded"
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

/* ---------- REUSABLE ---------- */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        required
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function SubmitBtn({ loading, text }) {
  return (
    <button
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
    >
      {loading ? "Please wait..." : text}
    </button>
  );
}
