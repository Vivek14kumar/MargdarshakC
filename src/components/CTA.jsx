import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-black via-zinc-900 to-red-700 text-white py-24 px-6 text-center relative overflow-hidden">

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-snug">
        Get Admission Enquiry for
        <span className="text-red-500 block mt-1">
          Margdarshak Career Institute
        </span>
      </h2>

      {/* Subheading */}
      <p className="mb-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-200">
        Top, Best & Affordable Coaching Institute & Tutorial in
        <span className="text-red-400 font-semibold">
          {" "}Muzaffarpur, Bihar
        </span>{" "}
        for <strong>Board, NEET & JEE</strong> preparation.
      </p>

      <p className="mb-12 text-base md:text-lg text-gray-300">
        Parents & students can directly contact us for admission guidance,
        batches, fees & demo classes.
      </p>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-5 flex-wrap">
        <a
          href="https://wa.me/91XXXXXXXXXX?text=Hello%20Margdarshak%20Career%20Institute,%20I%20want%20admission%20details%20for%20Board/NEET/JEE."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg
          shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <FaWhatsapp size={20} />
          WhatsApp Enquiry
        </a>

        <a
          href="tel:+919521754065"
          className="inline-flex items-center gap-2 bg-white text-red-700 px-8 py-4 rounded-full font-semibold text-lg
          shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <FaPhoneAlt size={18} />
          Call for Admission
        </a>
      </div>

      {/* Trust Line */}
      <p className="mt-10 text-sm text-gray-300 tracking-wide">
        Trusted by parents • Experienced faculty • Result-oriented coaching
      </p>

      {/* Decorative elements */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-red-600 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-red-500 rounded-full opacity-20 blur-3xl"></div>
    </section>
  );
}
