import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaRoute,
} from "react-icons/fa";
import SEO from "../components/SEO";

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact Us – Margdarshak Career Institute"
        description="Get in touch with Margdarshak Career Institute in Muzaffarpur, Bihar for NEET, JEE, and Board exam coaching."
        keywords="Contact Margdarshak Career Institute, NEET coaching, JEE coaching, Muzaffarpur"
        image="https://yourdomain.com/contact-og.jpg"
        url="https://yourdomain.com/contact"
      />

      <section className="bg-gradient-to-b from-slate-50 to-white py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Heading */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
              Get in <span className="text-red-600">Touch</span>
            </h2>
            <p className="mt-3 text-gray-600 text-base sm:text-lg">
              Have questions? We’re here to help you.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            {/* Contact Info */}
            <div className="space-y-4">

              {/* Phone */}
              <div className="flex gap-4 bg-white p-5 rounded-xl shadow-md">
                <FaPhoneAlt className="text-red-600 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Call Us</h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    +91 95217 54065
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 bg-white p-5 rounded-xl shadow-md">
                <FaEnvelope className="text-red-600 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Email</h4>
                  <p className="text-gray-600 text-xs break-all md:text-sm">
                    margdarshakcareerinstitute@gmail.com
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4 bg-white p-5 rounded-xl shadow-md">
                <FaMapMarkerAlt className="text-red-600 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Visit Us</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Prakash Jewellers Building, Kacchi Pakki Bus Stand Road,
                    Near Kabristan, Attardah, Patepur,
                    Muzaffarpur, Bihar – 842002
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <a
                  href="https://wa.me/xxxxxxxxxx?text=Hello%20I%20want%20coaching%20details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-full font-semibold transition shadow-lg"
                >
                  <FaWhatsapp className="text-xl" />
                  WhatsApp Chat
                </a>

                <a
                  href="tel:+919521754065"
                  className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-full font-semibold transition shadow-lg"
                >
                  <FaPhoneAlt className="text-xl" />
                  Call Now
                </a>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white p-5 rounded-xl shadow-md flex flex-col gap-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Our Location
              </h3>

              <div className="rounded-lg overflow-hidden border h-60 sm:h-72 md:h-80">
                <iframe
                  title="Margdarshak Career Institute Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3583.181757423548!2d85.38672217467173!3d26.092984894838196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed11066bc1e3b7%3A0x377c1384f6d71c4!2sMargdarshak%20career%20institute!5e0!3m2!1sen!2sin!4v1767678007271!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=26.0929849,85.3867221"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-semibold transition"
              >
                <FaRoute />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
