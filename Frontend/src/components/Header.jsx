import { useDispatch } from "react-redux";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { logout } from "../store/authSlice";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";
import { FaMoneyBillWave } from "react-icons/fa";
import { Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const fullText = "MessEase";
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/student/logout", {});
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/student/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const [code, setCode] = useState("000");

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const userRes = await api.post("/api/student/verify-token");
        setCode(userRes.data.code);
      } catch (error) {
        console.error("Error fetching code:", error);
      }
    };
    fetchCode();
  }, []);

  // Navigation links with their paths and icons (similar to AdminHeader)
  const navLinks = [
    { title: "Home", path: "/student/home", icon: "home" },
    { title: "Elections", path: "/student/election", icon: "vote-yea" },
    { title: "Profile", path: "/student/profile", icon: "user" },
    { title: "Fees", path: "/student/fees", icon: "money" },
    { title: "Mess", path: `/student/mess/${code}`, icon: "mess" },
  ];

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-lg h-[60px]">
      <div className="flex items-center w-[200px]">
        <Logo />
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold border-b-2 border-blue-400 pb-1 flex items-center"
                : "text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center"
            }
          >
            {link.icon === "home" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            )}
            {link.icon === "vote-yea" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            )}
            {link.icon === "user" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {link.icon === "money" && <FaMoneyBillWave className="mr-2" />}
            {link.icon === "mess" && code != "000" && (
              <Utensils className="h-4 mr-1" />
            )}
            {link.icon === "mess"
              ? code !== "000"
                ? link.title
                : null
              : link.title}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu Button (hidden on desktop) */}
      <div className="md:hidden relative">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-[100] p-2 shadow bg-gray-800 rounded-md w-39 mt-2 fixed right-0 top-[40px] max-h-[calc(100vh-60px)] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? "font-semibold text-blue-400" : "text-gray-300"
                  }
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
            <li className="border-t border-gray-700 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Button (hidden on desktop) */}
      <button
        onClick={handleLogout}
        className="hidden md:flex items-center bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 px-4 py-2 rounded-md transition duration-200 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
            clipRule="evenodd"
          />
        </svg>
        Logout
      </button>
    </header>
  );
};

export default Header;
