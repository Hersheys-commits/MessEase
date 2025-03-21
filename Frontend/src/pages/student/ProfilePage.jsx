// src/pages/student/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaBuilding,
  FaGraduationCap,
  FaHome,
  FaEdit,
  FaDoorOpen,
} from "react-icons/fa";
import api from "../../utils/axiosRequest";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [college, setCollege] = useState(null);
  const [hostelMess, setHostelMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Fetch user data, college and hostel/mess details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify token and get user data
        const userRes = await api.post("/api/student/verify-token");
        const userInfo = userRes.data.userInfo;
        setUser(userInfo);

        // Fetch college data
        const collegeRes = await api.get("/api/college/getCollege");
        console.log(collegeRes);
        setCollege(collegeRes.data.college);

        // Fetch hostel and mess details for the user's assigned hostel/mess
        const hmRes = await api.post("/api/hostel/getHostelMess");
        console.log("first", hmRes);
        setHostelMess(hmRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !user) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* Profile Picture Section */}
          <div className="md:w-1/3 flex justify-center items-center p-6">
            {user.profilePicture == "" ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gray-700 border-4 border-blue-500">
                <FaUser size={80} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="md:w-2/3 p-6">
            <h2 className="text-3xl font-bold mb-4">{user.name}</h2>
            <div className="space-y-3 text-lg">
              {user.rollNumber && (
                <div className="flex items-center">
                  <FaUser className="mr-2 text-blue-400" />
                  <span>Roll Number: {user.rollNumber}</span>
                </div>
              )}
              {college && (
                <div className="flex items-center">
                  <FaBuilding className="mr-2 text-blue-400" />
                  <span>College: {college.name}</span>
                </div>
              )}
              {hostelMess && hostelMess.mess && (
                <div className="flex items-center">
                  <FaHome className="mr-2 text-blue-400" />
                  <span>Mess: {hostelMess.mess.name}</span>
                </div>
              )}
              {hostelMess && hostelMess.hostel && (
                <div className="flex items-center">
                  <FaBuilding className="mr-2 text-blue-400" />
                  <span>Hostel: {hostelMess.hostel.name}</span>
                </div>
              )}
              <div className="flex items-center">
                <FaGraduationCap className="mr-2 text-blue-400" />
                <span>
                  {user.branch ? user.branch : "Branch not set"} -{" "}
                  {user.year ? `${user.year} Year` : "Year not set"}
                </span>
              </div>
              {user.room && (
                <div className="flex items-center">
                  <FaDoorOpen className="mr-2 text-blue-400" />
                  <span>Room: {user.room}</span>
                </div>
              )}
              {user.phoneNumber && (
                <div className="flex items-center">
                  <FaPhone className="mr-2 text-blue-400" />
                  <span>Phone: {user.phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate("/student/update-profile")}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
              >
                <FaEdit className="mr-2" /> Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
