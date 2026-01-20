import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaBookOpen,
  FaInfoCircle,
  FaPhoneAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import logo from "../assets/images/logo.webp";

export default function Navbar() {
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    {name: "LogIn", path: "/login"},
    {name: "SignUp", path: "/signup"},
  ];

  return (
    <>
      {/* TOP NAVBAR */}
      <nav
        className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Go to Margdarshak Career Institute home page"
          >
            <img
              src={logo}
              alt="Margdarshak Career Institute Coaching in Muzaffarpur Bihar"
              className="w-14 h-14 object-contain"
              loading="eager"
            />
            <div className="leading-tight">
              {/* h2 instead of h1 for SEO */}
              <h2 className="md:text-xl font-extrabold text-red-600">
                Margdarshak Career Institute
              </h2>
              <p className="text-xs text-gray-500">
                Learn • Practice • Succeed
              </p>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="relative hidden md:flex gap-10 font-medium text-gray-700">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={`Go to ${item.name} page`}
                  className={`relative pb-1 transition ${
                    isActive ? "text-red-600" : "hover:text-red-600"
                  }`}
                >
                  {item.name}

                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 -bottom-1 h-[2px] w-full bg-red-600 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CALL BUTTON */}
          <a
            href="tel:+919521754065"
            aria-label="Call Margdarshak Career Institute"
            className="hidden md:inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-semibold transition shadow"
          >
            <FaPhoneAlt />
            Call Now
          </a>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around py-2 text-xs">

          <Link
            to="/"
            aria-label="Home"
            className={`${
              location.pathname === "/" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaHome size={20} />
            Home
          </Link>

          <Link
            to="/courses"
            aria-label="Courses"
            className={`${
              location.pathname === "/courses" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaBookOpen size={20} />
            Courses
          </Link>

          <Link
            to="/about"
            aria-label="About"
            className={`${
              location.pathname === "/about" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaInfoCircle size={20} />
            About
          </Link>

          <Link
            to="/contact"
            aria-label="Contact"
            className={`${
              location.pathname === "/contact" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaPhoneAlt size={20} />
            Contact
          </Link>
          
          <Link
            to="/login"
            aria-label="LogIn"
            className={`${
              location.pathname === "/contact" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaSignInAlt size={20} />
            LogIn
          </Link>
          
          <Link
            to="/signup"
            aria-label="SingUp"
            className={`${
              location.pathname === "/contact" ? "text-red-600" : "text-gray-500"
            } flex flex-col items-center`}
          >
            <FaUserPlus size={20} />
            SignUp
          </Link>
        </div>
      </div>
    </>
  );
}
