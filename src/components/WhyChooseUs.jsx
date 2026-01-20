import { FadeUp } from "./FadeUp";
import {
  FaChalkboardTeacher,
  FaVideo,
  FaUserCheck,
} from "react-icons/fa";

export default function WhyUs() {
  const features = [
    {
      title: "Expert Faculty for BOARD, NEET & JEE",
      desc: "Highly experienced teachers including Doctors and Engineers, focused on strong concepts, exam strategy, and personal attention for every student.",
      icon: <FaChalkboardTeacher />,
    },
    {
      title: "Smart Classes & Regular Test Series",
      desc: "Smart board classrooms, daily DPPs, weekly and monthly tests strictly designed as per BOARD, NEET, and JEE exam patterns.",
      icon: <FaVideo />,
    },
    {
      title: "Personal Mentorship at Affordable Fees",
      desc: "One-to-one doubt solving, performance tracking, motivation sessions, and quality education at affordable fees in Muzaffarpur, Bihar.",
      icon: <FaUserCheck />,
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-28">
      
      {/* HEADING */}
      <div className="text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Why Students Trust{" "}
          <span className="text-red-600">
            Margdarshak Career Institute
          </span>
        </h2>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Top, Best & Affordable Coaching Institute in Muzaffarpur, Bihar
          for <strong>BOARD, NEET & JEE</strong>
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-3">
        {features.map((item, i) => (
          <FadeUp key={i}>
            <div
              className="group relative bg-white/80 backdrop-blur
              rounded-3xl p-8 text-center
              shadow-lg hover:shadow-2xl
              transition-all duration-300 hover:-translate-y-3"
            >
              {/* ICON */}
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl
                flex items-center justify-center text-2xl text-white
                bg-gradient-to-r from-red-600 to-red-700
                shadow-md group-hover:scale-110 transition"
              >
                {item.icon}
              </div>

              {/* CONTENT */}
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.desc}
              </p>

              {/* HOVER GLOW */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0
                group-hover:opacity-10 transition
                bg-gradient-to-r from-red-600 to-red-700"
              />
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
