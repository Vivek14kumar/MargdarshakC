import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Rohit Kumar",
      comment:
        "It is one of best coaching institutes with a team of Doctors and Engineers...",
      rating: 5,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "Shreya Sharma",
      comment:
        "It is the best institute for NEET and JEE preparation...",
      rating: 5,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      name: "Ritika Kumari",
      comment:
        "My experience here has been incredibly enriching...",
      rating: 5,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      name: "Chandan Kumar",
      comment:
        "Best institute for NEET and JEE aspirants...",
      rating: 4,
      gradient: "from-orange-500 to-amber-600",
    },
    {
      name: "Narendra Kumar Gautam",
      comment:
        "As a parent, I believe this is the best institute...",
      rating: 5,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, reviews.length]);

  return (
    <section className="bg-gradient-to-b from-zinc-100 to-white py-28">
      {/* Heading */}
      <div className="text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          What <span className="text-red-600">Students Say</span>
        </h2>
        <p className="mt-4 text-gray-600">
          Real feedback from students & parents
        </p>
      </div>

      {/* Carousel */}
      <div
        className="max-w-full mx-auto overflow-hidden px-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {reviews.map((review, i) => (
            <div key={i} className="min-w-full px-4">
              <div className="relative bg-white rounded-3xl p-10 shadow-2xl overflow-hidden">
                <FaQuoteLeft className="text-gray-200 text-4xl mb-6" />

                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  “{review.comment}”
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center
                      text-white font-bold text-lg bg-gradient-to-r ${review.gradient}`}
                    >
                      {review.name.charAt(0)}
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {review.name}
                    </p>
                  </div>

                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-3xl opacity-10
                  bg-gradient-to-r ${review.gradient}`}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition ${
                i === index ? "bg-red-600 scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
