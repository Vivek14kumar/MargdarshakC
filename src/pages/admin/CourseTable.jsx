import {
  collection,
  orderBy,
  query,
  doc,
  onSnapshot,
  limit,
  startAfter,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
import EditCourseModal from "./EditCourseModal";
import { Pencil } from "lucide-react";

const PAGE_SIZE = 5;

export default function CourseTable() {
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);

  const [tab, setTab] = useState("active"); // 🔥 active | archived
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ===============================
     REAL-TIME FIRST PAGE
  =============================== */
  useEffect(() => {
    setCourses([]);
    setLastDoc(null);
    setHasMore(true);

    const q = query(
      collection(firestore, "courses"),
      where("status", "==", tab), // 🔥 FILTER FIX
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setCourses(list);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    });

    return () => unsubscribe();
  }, [tab]);

  /* ===============================
     LOAD MORE
  =============================== */
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    setLoadingMore(true);

    const q = query(
      collection(firestore, "courses"),
      where("status", "==", tab),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const more = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setCourses((prev) => [...prev, ...more]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  /* ===============================
     ARCHIVE / RESTORE
  =============================== */
  const toggleArchive = async (course) => {
    const nextStatus =
      course.status === "active" ? "archived" : "active";

    await updateDoc(doc(firestore, "courses", course.id), {
      status: nextStatus,
    });
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Courses</h3>

        {/* 🔥 TABS */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              tab === "active"
                ? "bg-indigo-600 text-white"
                : "text-slate-600"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setTab("archived")}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              tab === "archived"
                ? "bg-indigo-600 text-white"
                : "text-slate-600"
            }`}
          >
            Archived
          </button>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>Title</th>
                <th>Duration</th>
                <th>Highlight</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td>{course.title}</td>
                  <td>{course.duration}</td>
                  <td>{course.highlight || "-"}</td>

                  <td className="text-right flex justify-end gap-3 py-2">
                    <button
                      onClick={() => setEditCourse(course)}
                      className="text-indigo-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => toggleArchive(course)}
                      className={`text-sm ${
                        course.status === "archived"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {course.status === "archived"
                        ? "Restore"
                        : "Archive"}
                    </button>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-3 flex justify-between"
            >
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-xs text-slate-500">
                  Duration: {course.duration}
                </p>
                {course.highlight && (
                  <p className="text-xs text-slate-600">
                    {course.highlight}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 text-right">
                <button
                  onClick={() => setEditCourse(course)}
                  className="text-indigo-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleArchive(course)}
                  className={`text-sm ${
                    course.status === "archived"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {course.status === "archived"
                    ? "Restore"
                    : "Archive"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-4 border border-indigo-600
            text-indigo-600 py-1.5 rounded-md text-sm
            hover:bg-indigo-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>

      {/* EDIT MODAL */}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onSaved={() => setEditCourse(null)}
        />
      )}
    </>
  );
}
