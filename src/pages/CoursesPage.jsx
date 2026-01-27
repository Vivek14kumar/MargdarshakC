import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query, limit as fbLimit } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import SEO from "../components/SEO";

export default function CoursesPage({ limit }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const ref = collection(firestore, "courses");

      const q = limit ? query(ref, fbLimit(limit)) : ref;
      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCourses(data);
      setLoading(false);
    }

    fetchCourses();
  }, [limit]);

  return (
    <>
    <SEO
      title="Courses – Margdarshak Career Institute"
      description="Explore CBSE, BSEB, NEET & JEE coaching courses."
    />
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Courses <span className="text-red-600">We Offer</span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
            Result-oriented coaching for BOARD, NEET & JEE aspirants
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading courses...</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map(course => (
              <Link
                key={course.slug}
                to={`/courses/${course.slug}`}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl
                transition-all duration-300 hover:-translate-y-2 p-6 border"
              >
                <h3 className="text-lg font-bold mb-2 group-hover:text-red-600">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {course.desc}
                </p>

                <p className="text-sm text-gray-500 mb-6">
                  ✔ {course.highlight}
                </p>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>View Details</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {limit && (
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition"
            >
              View All Courses →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
