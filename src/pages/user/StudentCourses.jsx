import { useEffect, useState } from "react";
import { auth, firestore } from "../../firebaseConfig";
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { BookOpen, Plus } from "lucide-react";
import StudentNavbar from "../../components/StudentNavbar";
import StudentBottomNav from "../../components/StudentBottomNav";

export default function StudentCourses() {
  const [userData, setUserData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Get user data
      const userSnap = await getDoc(doc(firestore, "users", user.uid));
      if (!userSnap.exists()) return;
      setUserData(userSnap.data());

      // Get all courses
      const coursesSnap = await getDocs(collection(firestore, "courses"));
      const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllCourses(courses);

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEnroll = async (course) => {
    if (!userData) return;

    const userRef = doc(firestore, "users", auth.currentUser.uid);

    // Add course to enrolledCourses array
    await updateDoc(userRef, {
      enrolledCourses: arrayUnion(course.title || course.id)
    });

    // Refresh userData
    const updatedUser = await getDoc(userRef);
    setUserData(updatedUser.data());
  };

  if (loading) return <PageSkeleton />;

  // Split courses into enrolled and available
  const enrolledCourses = allCourses.filter(course =>
    userData.enrolledCourses?.some(e => e === course.id || e === course.title)
  );
  const availableCourses = allCourses.filter(course =>
    !userData.enrolledCourses?.some(e => e === course.id || e === course.title)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <StudentNavbar className="hidden md:flex fixed top-0 left-0 h-full z-20" />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-64 px-4 md:px-8 pb-28">
        <h1 className="text-3xl font-bold text-red-700 mt-6">My Courses</h1>

        {/* Enrolled Courses */}
        <Section title="Enrolled Courses">
          {enrolledCourses.length > 0 ? (
            <CourseGrid>
              {enrolledCourses.map(course => (
                <CourseCard key={course.id} course={course} enrolled />
              ))}
            </CourseGrid>
          ) : (
            <EmptyMessage text="You have not enrolled in any courses yet." />
          )}
        </Section>

        {/* Available Courses */}
        <Section title="Available Courses">
          {availableCourses.length > 0 ? (
            <CourseGrid>
              {availableCourses.map(course => (
                <CourseCard key={course.id} course={course} onEnroll={() => handleEnroll(course)} />
              ))}
            </CourseGrid>
          ) : (
            <EmptyMessage text="No more courses available to enroll." />
          )}
        </Section>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <StudentBottomNav className="md:hidden" />
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function CourseGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function CourseCard({ course, enrolled, onEnroll }) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg p-6
      hover:shadow-2xl hover:scale-[1.02] transition-transform duration-200 cursor-pointer
      ${enrolled ? "max-w-md mx-auto" : ""}`} // only enrolled courses get smaller card
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-700 rounded-xl">
          <BookOpen size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
      </div>

      <p className="text-gray-500 text-sm mb-4">{course.desc || "No description available"}</p>

      {enrolled ? (
        <span className="text-green-600 font-semibold inline-flex items-center gap-1">
          ✅ Enrolled
        </span>
      ) : (
        <button
          onClick={onEnroll}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm hover:brightness-110 transition"
        >
          <Plus size={16} />
          Enroll Now
        </button>
      )}
    </div>
  );
}

function EmptyMessage({ text }) {
  return <p className="text-gray-500">{text}</p>;
}

function PageSkeleton() {
  return (
    <div className="animate-pulse mt-6 space-y-6 px-4 md:px-0">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-40 bg-white/80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
