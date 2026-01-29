import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

/* ICON HELPER */
const FeatureIcon = ({ type }) => {
  const icons = {
    video: "🎥",
    clipboard: "📝",
    chat: "💬",
    user: "👨‍🏫",
    book: "📘",
    document: "📄",
    clock: "⏱️",
    chart: "📊",
  };
  return <span className="text-xl">{icons[type] || "✔"}</span>;
};

const PHONE = "+919999999999";
const WHATSAPP = "919999999999";

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const q = query(
          collection(firestore, "courses"),
          where("slug", "==", slug),
          where("status", "==", "active"),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setCourse(snap.docs[0].data());
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [slug]);

  /* ⏳ LOADING */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  /* ❌ NOT FOUND / ARCHIVED */
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-3">Course Not Available</h2>
        <p className="text-gray-600 mb-6">
          This course is either archived or does not exist.
        </p>
        <Link
          to="/courses"
          className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition"
        >
          View All Courses →
        </Link>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Hello, I want admission details for ${course.title}`
  );

  return (
    <>
      <SEO
        title={`${course.title} – Margdarshak Career Institute`}
        description={course.desc}
      />

      <section className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="max-w-3xl mx-auto">

          <nav className="text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-red-600">Home</Link> /{" "}
            <Link to="/courses" className="hover:text-red-600">Courses</Link> /{" "}
            <span className="font-semibold text-gray-800">
              {course.title}
            </span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <h1 className="text-3xl font-extrabold mb-3">
              {course.title}
            </h1>

            <p className="text-gray-600 text-lg">
              {course.desc}
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              Course Features
            </h2>

            <ul className="space-y-3">
              {course.features?.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <FeatureIcon type={f.icon} />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 text-white py-3 rounded-full w-full text-center
                hover:scale-105 transition shadow-lg font-semibold text-lg"
              >
                WhatsApp for Admission
              </a>

              <a
                href={`tel:${PHONE}`}
                className="border border-red-600 text-red-600 py-3 rounded-full
                w-full text-center hover:bg-red-50 transition font-semibold text-lg"
              >
                Call for Details
              </a>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Fees & batch details shared personally
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
