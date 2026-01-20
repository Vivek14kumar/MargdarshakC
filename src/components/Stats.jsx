import { motion } from "framer-motion";

const stats = [
  { label: "Students", value: 10000 },
  { label: "Selections", value: 1200 },
  { label: "Years Experience", value: 8 },
];

export default function Stats() {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-3xl font-bold">{s.value}+</p>
            <p className="text-sm mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
