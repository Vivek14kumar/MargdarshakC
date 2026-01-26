import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/images/logoFooter.webp";

export default function Footer() {
  /* ================= CONTACT DETAILS ================= */
  const PHONE = "+91 9521754065";
  const WHATSAPP_NUMBER = "91xxxxxxxxxx";

  const whatsappMessage =
    "Hello, I want coaching admission enquiry for BOARD / NEET / JEE classes.";

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  /* ================= GOOGLE MAP LINK ================= */
  const directionLink =
    "https://www.google.com/maps/dir/?api=1&destination=Margdarshak+Career+Institute+Muzaffarpur";

  return (
    <footer className="bg-black text-gray-400">

      {/* Top Red Accent Line */}
      <div className="h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-12 md:grid-cols-3">

        {/* ================= BRAND ================= */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Margdarshak Career Institute Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Margdarshak Career Institute
              </h3>
              <p className="text-xs text-gray-500">
                Learn • Practice • Succeed
              </p>
            </div>
          </div>

          <p className="text-sm mt-4 max-w-sm leading-relaxed">
            Empowering students for Board, NEET, JEE & academic excellence
            through expert faculty, mentorship & result-oriented learning.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 text-green-500 font-semibold hover:text-green-400 transition"
          >
            <FaWhatsapp className="text-xl" />
            Chat on WhatsApp
          </a>
        </div>

        {/* ================= QUICK LINKS ================= */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/courses" className="hover:text-red-500 transition">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-red-500 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-red-500 transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-red-500 transition">
                Gallery
              </Link>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-5 text-xl mt-6">
            <a
              href="https://www.instagram.com/margdarshakcareerinstitute/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:scale-110 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com/@margdarshakcareerinstitute"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:scale-110 transition"
            >
              <FaYoutube />
            </a>

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 hover:scale-110 transition"
            >
              <FaFacebook />
            </a>
          </div>
        </div>

        {/* ================= LOCATION ================= */}
        <div>
          <h4 className="text-white font-semibold mb-4">Our Location</h4>

          <div className="rounded-xl overflow-hidden border border-gray-800">
            <iframe
              title="Margdarshak Career Institute Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3583.181757423548!2d85.38672217467173!3d26.092984894838196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed11066bc1e3b7%3A0x377c1384f6d71c4!2sMargdarshak%20Career%20Institute!5e0!3m2!1sen!2sin!4v1767678007271"
              className="w-full h-48 border-0"
              loading="lazy"
            />
          </div>

          {/* Address */}
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 text-red-500" />
              <span>
                Margdarshak Career Institute,<br />
                Prakash Jewellers Building,<br />
                Kacchi Pakki Bus Stand Road,<br />
                Attardah, Patepur,<br />
                Muzaffarpur, Bihar – 842002
              </span>
            </p>

            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-red-500" />
              <a href={`tel:${PHONE}`} className="hover:text-white transition">
                {PHONE}
              </a>
            </p>

            <a
              href={directionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-red-500 font-semibold hover:underline"
            >
              Get Directions →
            </a>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Margdarshak Career Institute <br />
        Designed by{" "}
        <a
          href="mailto:viktechzweb@gmail.com?subject=Website%20Design%20Inquiry"
          className="text-white hover:text-red-500 transition"
        >
          VIK-TECHZ
        </a>
      </div>
    </footer>
  );
}
