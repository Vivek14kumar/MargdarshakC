import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import Sidebar from "../components/Sidebar";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaImage,
  FaFilePdf,
  FaPoll,
} from "react-icons/fa";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      
      {/* ===== TOP NAV ===== */}
      <div className="flex-shrink-0">
        <TopNav onMenuClick={() => setOpen(!open)} />
      </div>

      {/* ===== BODY ===== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR (DESKTOP ONLY) */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ===== BOTTOM NAV (MOBILE ONLY) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
        bg-white border-t shadow-lg">
        <div className="flex justify-around items-center h-14">
          <BottomLink to="/admin/dashboard" icon={FaHome} text="Home" end />
          <BottomLink to="/admin/dashboard/add-course" icon={FaBook} text="Course" />
          <BottomLink to="/admin/dashboard/upload-photo" icon={FaImage} text="Photos" />
          <BottomLink to="/admin/dashboard/upload-pdf" icon={FaFilePdf} text="Notes" />
          <BottomLink to="/admin/dashboard/upload-result" icon={FaPoll} text="Result" />
        </div>
      </nav>

    </div>
  );
}

/* ===== MOBILE NAV ITEM ===== */

function BottomLink({ to, icon: Icon, text, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center text-xs transition
        ${isActive ? "text-red-600" : "text-gray-500"}`
      }
    >
      <Icon className="text-lg" />
      <span>{text}</span>
    </NavLink>
  );
}
