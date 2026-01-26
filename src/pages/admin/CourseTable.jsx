import {
  collection,
  orderBy,
  query,
  deleteDoc,
  doc,
  onSnapshot,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
import EditCourseModal from "./EditCourseModal";
import { Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 5;

export default function CourseTable() {
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);

  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const onCourseSaved = () => {
  setEditCourse(null);
};

  /* ===============================
     REAL-TIME FIRST PAGE
  =============================== */
  useEffect(() => {
    const q = query(
      collection(firestore, "courses"),
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
  }, []);

  /* ===============================
     LOAD MORE (PAGINATION)
  =============================== */
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    setLoadingMore(true);

    const q = query(
      collection(firestore, "courses"),
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
     DELETE COURSE
  =============================== */
  const deleteCourse = async (id) => {
    const ok = confirm("Are you sure you want to delete this course?");
    if (!ok) return;

    await deleteDoc(doc(firestore, "courses", id));
    // 🔥 no refetch needed (onSnapshot handles it)
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Courses</h3>

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
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-3 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-xs text-slate-500">
                  Duration: {course.duration}
                </p>
                {course.highlight && (
                  <p className="text-xs text-slate-600 mt-1">
                    {course.highlight}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditCourse(course)}
                  className="text-indigo-600"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="text-red-600"
                >
                  <Trash2 size={18} />
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
    onSaved={onCourseSaved}
  />
)}

    </>
  );
}
