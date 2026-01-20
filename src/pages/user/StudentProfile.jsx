import { useEffect, useState } from "react";
import { auth, firestore } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import StudentBottomNav from "../../components/StudentBottomNav";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentProfile() {
  const uid = auth.currentUser?.uid;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      try {
        const userSnap = await getDoc(doc(firestore, "users", uid));
        if (!userSnap.exists()) {
          setError("User not found.");
        } else {
          setUserData(userSnap.data());
          setNewAddress(userSnap.data().address || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  // Save address
  const saveAddress = async () => {
    if (!uid || !newAddress.trim()) return;
    setSaving(true);

    try {
      await updateDoc(doc(firestore, "users", uid), { address: newAddress });
      setUserData({ ...userData, address: newAddress });
      alert("Address saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 md:pl-[296px] p-4 animate-pulse space-y-4">
        <div className="h-12 w-64 bg-gray-200 rounded-xl"></div>
        <div className="h-32 w-full bg-white rounded-2xl shadow"></div>
        <div className="h-32 w-full bg-white rounded-2xl shadow"></div>
      </div>
    );
  }

  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 md:pl-[296px] pb-28">
      {/* Desktop Navbar */}
      <StudentNavbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-4">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold text-gray-900">{userData.name || "-"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold text-gray-900">{userData.email || "-"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">Mobile</p>
              <p className="font-semibold text-gray-900">{userData.mobile || "-"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">Address</p>
              <p className="font-semibold text-gray-900">
                {userData.address || "Not added"}
              </p>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Enrolled Courses</h2>
            {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
              <ul className="list-disc list-inside text-gray-800">
                {userData.enrolledCourses.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No courses enrolled yet</p>
            )}
          </div>
        </div>

        {/* Address Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Update Address</h2>
          <input
            type="text"
            placeholder="Enter your address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          <button
            onClick={saveAddress}
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <StudentBottomNav />
    </div>
  );
}
