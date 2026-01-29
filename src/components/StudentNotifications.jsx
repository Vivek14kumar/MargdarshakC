import { useEffect, useState } from "react";
import { auth, firestore } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import {
  Bell,
  FileText,
  BarChart2,
  AlertCircle,
  BookOpen,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StudentNotifications() {
  const [items, setItems] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  /* ===============================
     FETCH ENROLLED COURSES
  =============================== */
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUser = async () => {
      const snap = await getDoc(
        doc(firestore, "users", auth.currentUser.uid)
      );
      if (snap.exists()) {
        setEnrolledCourses(snap.data().enrolledCourses || []);
      }
    };

    fetchUser();
  }, []);

  /* ===============================
     LISTEN TO NOTIFICATIONS
  =============================== */
  useEffect(() => {
    const q = query(
      collection(firestore, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const filtered = all.filter((n) => {
        // Global notifications (course announcements)
        if (n.type === "course" && !n.courseId) return true;

        // Course-based notifications
        if (n.courseId) {
          return enrolledCourses.includes(n.courseId);
        }

        return false;
      });

      setItems(filtered);
    });

    return () => unsub();
  }, [enrolledCourses]);

  /* ===============================
     DELETE HANDLERS
  =============================== */
  const deleteNotification = async (id) => {
    await deleteDoc(doc(firestore, "notifications", id));
  };

  const deleteAllNotifications = async () => {
    const batch = writeBatch(firestore);
    items.forEach((n) =>
      batch.delete(doc(firestore, "notifications", n.id))
    );
    await batch.commit();
  };

  /* ===============================
     CLICK HANDLER
  =============================== */
  const handleClick = async (n) => {
    await deleteNotification(n.id);

    if (n.type === "notes") navigate("/student/notes");
    else if (n.type === "result") navigate("/student/results");
    else navigate("/student/courses");
  };

  return (
    <div className="px-4 mt-8">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border p-5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell size={18} /> Notifications
            {items.length > 0 && (
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </h3>

          {items.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="text-xs text-blue-600 flex items-center gap-1"
            >
              <CheckCheck size={14} /> Clear all
            </button>
          )}
        </div>

        {/* CONTENT */}
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {items.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleClick(n)}
                className="flex gap-3 p-3 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100"
              >
                <Icon type={n.type} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
                <span className="w-2 h-2 mt-2 rounded-full bg-red-600" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===============================
   ICON HELPER
=============================== */
function Icon({ type }) {
  const map = {
    notes: <FileText size={18} />,
    result: <BarChart2 size={18} />,
    alert: <AlertCircle size={18} />,
    course: <BookOpen size={18} />,
  };

  return (
    <div className="min-w-[36px] h-9 rounded-xl bg-white shadow flex items-center justify-center text-red-600">
      {map[type] || <Bell size={18} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <Bell size={32} className="mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-500">No notifications yet</p>
    </div>
  );
}
