import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import hostelService from "../../utils/hostelCheck";

function StudentHome() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const verifyHostel = async () => {
      try {
        const data = await hostelService.checkHostelAssignment();
        if (data.data.user.role === "student" && !data.data.user.hostel) {
          toast.error("Hostel must be assigned.");
          navigate("/student/update-profile");
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate("/student/login");
      }
    };
    verifyHostel();
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post("/api/student/verify-token");
        setUserId(res.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error verifying token:", error);
        navigate("/student/login");
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-white">
          Student Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">
              Room Management
            </h2>
            <p className="text-gray-300 mb-6">
              View available rooms and manage your bookings
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() =>
                  navigate("/available-rooms", { state: { userId } })
                }
                className="px-4 py-3 bg-indigo-600 text-white rounded-md w-full hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
              >
                <span>Available Rooms</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigate("/see-booking", { state: { userId } })}
                className="px-4 py-3 bg-indigo-600 text-white rounded-md w-full hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
              >
                <span>Your Bookings</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">
              Elections
            </h2>
            <p className="text-gray-300 mb-6">
              Participate in campus elections and view results
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => navigate("/student/election")}
                className="px-4 py-3 bg-indigo-600 text-white rounded-md w-full hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
              >
                <span>View Elections</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300">
              Profile Settings
            </button>
            <button className="px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300">
              Notifications
            </button>
            <button className="px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300">
              Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
