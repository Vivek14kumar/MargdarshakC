import { motion } from "framer-motion";
import {
  FaPhoneAlt,
  FaStar,
  FaUserGraduate,
  FaTrophy,
  FaWhatsapp,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import SEO from "../components/SEO";
import studentImg from "../assets/images/students.jpg";

export default function Hero() {
  return (
    <>
      <SEO
        title="Margdarshak Career Institute – Top Coaching in Muzaffarpur"
        description="Join Margdarshak Career Institute for NEET, JEE & Board exams. Expert teachers, live classes, personal mentorship, and smart learning."
        keywords="NEET coaching, JEE coaching, Board exam coaching, Muzaffarpur, Bihar, Margdarshak Career Institute"
        image="https://yourdomain.com/hero-og.jpg"
        url="https://yourdomain.com"
      />

      {/* RED THEME GRADIENT */}
      <section className="bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto px-4 py-16 grid gap-12 md:grid-cols-2 items-center">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2"
          >
            <img
              src={studentImg}
              alt="Students of Margdarshak Career Institute"
              loading="lazy"
              className="w-full rounded-3xl shadow-xl"
            />
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            {/* BADGES */}
            <div className="flex gap-3 mb-5">
              <span className="flex items-center gap-2 bg-white px-2 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold text-red-600 shadow">
                <FaClock className="text-red-500" />
                Since 2015
              </span>

              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold text-red-600 shadow">
                <FaCheckCircle className="text-red-500" />
                100% Result-Oriented Teaching
              </span>
            </div>

            {/* HEADING */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-snug">
              Top, Best & Affordable Coaching Institute in{" "}
              <span className="text-red-600">Muzaffarpur, Bihar</span>
            </h1>

            {/* SUBTEXT */}
            <p className="mt-5 text-gray-700 text-base md:text-lg">
              Join <strong>Margdarshak Career Institute</strong> for expert guidance
              in <strong>BOARD, NEET & JEE</strong> with smart classrooms, regular
              tests, and personal mentorship.
            </p>

            {/* BUTTONS */}
            <div className="mt-7 flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="flex justify-center items-center gap-2 bg-green-600 text-white px-7 py-3 rounded-full font-semibold hover:scale-105 transition shadow"
              >
                <FaWhatsapp />
                Admission Enquiry
              </a>

              <a
                href="tel:+919521754065"
                className="flex justify-center items-center gap-2 border border-red-600 text-red-600 px-7 py-3 rounded-full font-semibold hover:bg-red-50 transition"
              >
                <FaPhoneAlt />
                Call Now
              </a>
            </div>

            {/* TRUST STATS */}
            <div className="mt-9 flex flex-wrap gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span>4.9+ Google Rating</span>
              </div>

              <div className="flex items-center gap-2">
                <FaUserGraduate className="text-red-600" />
                <span>Thousands of Students Guided</span>
              </div>

              <div className="flex items-center gap-2">
                <FaTrophy className="text-red-600" />
                <span>Excellent Board, NEET & JEE Results</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
