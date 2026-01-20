import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const whatsappNumber = "91xxxxxxxxxx";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello, I want coaching admission enquiry for BOARD/NEET/JEE classes."
  )}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-5 bottom-16 md:bottom-6 md:right-6 
                 bg-green-500 text-white p-4 md:p-5 rounded-full 
                 shadow-lg hover:scale-110 transition-all duration-300 
                 z-50 animate-pulse hover:animate-none
                 ring-4 ring-green-500/30"
    >
      <FaWhatsapp size={30} />
    </a>
  );
}
