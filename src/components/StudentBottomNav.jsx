import { Home, BookOpen, FileText, User,BarChart2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function StudentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeClass = (path) =>
    location.pathname === path
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md sm:hidden z-50">
      <div className="flex justify-around py-2">
        <button
          onClick={() => navigate("/student/dashboard")}
          className={`flex flex-col items-center text-xs ${activeClass("/dashboard")}`}
        >
          <Home size={20} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/student/courses")}
          className={`flex flex-col items-center text-xs ${activeClass("/dashboard/courses")}`}
        >
          <BookOpen size={20} />
          Courses
        </button>

        <button
          onClick={() => navigate("/student/notes")}
          className={`flex flex-col items-center text-xs ${activeClass("/dashboard/notes")}`}
        >
          <FileText size={20} />
          Notes
        </button>

        <button
          onClick={() => navigate("/student/results")}
          className={`flex flex-col items-center text-xs ${activeClass("/dashboard/results")}`}
        >
          <BarChart2 size={20} />
          Result
        </button>

        <button
          onClick={() => navigate("/student/profile")}
          className={`flex flex-col items-center text-xs ${activeClass("/dashboard/profile")}`}
        >
          <User size={20} />
          Profile
        </button>
      </div>
    </div>
  );
}
