import { useEffect, useState } from "react";
import { auth, firestore } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import StudentBottomNav from "../../components/StudentBottomNav";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentProfile() {
  const uid = auth.currentUser?.uid;

  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        // Fetch student
        const userSnap = await getDoc(doc(firestore, "users", uid));
        if (!userSnap.exists()) {
          setError("User not found");
          return;
        }

        const user = userSnap.data();
        setUserData(user);
        setNewAddress(user.address || "");

        // Fetch courses
        if (user.enrolledCourses?.length > 0) {
          const q = query(
            collection(firestore, "courses"),
            where("courseId", "in", user.enrolledCourses)
          );

          const snap = await getDocs(q);
          setCourses(
            snap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const saveAddress = async () => {
    if (!uid || !newAddress.trim()) return;
    setSaving(true);

    try {
      await updateDoc(doc(firestore, "users", uid), {
        address: newAddress,
      });
      setUserData({ ...userData, address: newAddress });
      alert("Address updated");
    } catch (err) {
      alert("Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 md:pl-[296px] pb-28">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <h1 className="text-3xl font-bold text-red-700">My Profile</h1>

        {/* Student Info */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Student Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Info label="Name" value={userData.name} />
            <Info label="Email" value={userData.email} />
            <Info label="Mobile" value={userData.mobile} />
            <Info label="Address" value={userData.address || "Not added"} />
            <Info
              label="Account Created"
              value={formatDate(userData.createdAt)}
            />
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>

          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map(course => (
                <div
                  key={course.courseId}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Batch Year: {course.batchYear} • Duration: {course.duration}
                    </p>
                  </div>

                  <span
                    className={`mt-2 md:mt-0 px-3 w-20 py-1 rounded-full text-sm font-semibold ${
                      course.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {course.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No courses enrolled</p>
          )}
        </div>

        {/* Update Address */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Update Address</h2>
          <input
            value={newAddress}
            onChange={e => setNewAddress(e.target.value)}
            className="w-full border p-3 rounded-xl"
            placeholder="Enter address"
          />
          <button
            onClick={saveAddress}
            disabled={saving}
            className="w-full bg-red-600 text-white py-3 rounded-xl"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}
