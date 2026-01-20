import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaImage,
  FaFilePdf,
  FaPoll,
  FaSignOutAlt,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Sidebar({ open, setOpen  }) {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden
        ${open ? "block" : "hidden"}`}
      />

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen w-64
          bg-white/95 backdrop-blur-xl
          border-r shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* BRAND */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-red-700">
            Admin Panel
          </h2>
          <p className="text-xs text-gray-500">
            Margdarshak Career Institute
          </p>
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-1">
          <SideLink to="/admin/dashboard" icon={FaHome} text="Dashboard" end onClick={() => setOpen(false)}/>
          <SideLink to="/admin/dashboard/add-course" icon={FaBook} text="Add Course" onClick={() => setOpen(false)} />
          <SideLink to="/admin/dashboard/upload-photo" icon={FaImage} text="Photos" onClick={() => setOpen(false)} />
          <SideLink to="/admin/dashboard/upload-pdf" icon={FaFilePdf} text="Notes PDF" onClick={() => setOpen(false)}/>
          <SideLink to="/admin/dashboard/upload-result" icon={FaPoll} text="Results" onClick={() => setOpen(false)}/>
        </nav>

        {/* LOGOUT */}
        <div className="absolute left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
            text-red-600 font-medium hover:bg-red-50 transition border border-red-500"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

/* ========================= */
/*        SIDELINK           */
/* ========================= */

function SideLink({ to, icon: Icon, text,end = false, onClick  }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium
         transition-all duration-200
         ${
           isActive
             ? "bg-red-50 text-red-700 border-l-4 border-red-600"
             : "text-gray-600 hover:bg-gray-100"
         }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`text-lg transition ${
              isActive ? "text-red-600" : "group-hover:text-red-500"
            }`}
          />
          <span>{text}</span>
        </>
      )}
    </NavLink>
  );
}
