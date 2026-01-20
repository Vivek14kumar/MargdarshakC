import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart2,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentBottomNav from "./StudentBottomNav";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard />, path: "/student/dashboard" },
    { label: "Courses", icon: <BookOpen />, path: "/student/courses" },
    { label: "Notes", icon: <FileText />, path: "/student/notes" },
    { label: "Results", icon: <BarChart2 />, path: "/student/results" },
    { label: "Profile", icon: <User />, path: "/student/profile" },
  ];

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-64 bg-white border-r min-h-screen p-5 flex-col gap-6 fixed left-0 top-0">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Student Panel
        </h2>

        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition
              ${
                active
                  ? "bg-red-100 text-red-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </aside>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <StudentBottomNav />
    </>
  );
}
