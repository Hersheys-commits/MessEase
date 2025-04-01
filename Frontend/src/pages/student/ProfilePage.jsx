import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FaUser,
  FaPhone,
  FaBuilding,
  FaGraduationCap,
  FaHome,
  FaEdit,
  FaDoorOpen,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../utils/axiosRequest";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";

const ProfilePage = () => {
  // Get user data from Redux store instead of making API call
  const { user: reduxUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [college, setCollege] = useState(null);
  const [hostelMess, setHostelMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/student/login");
      return;
    }

    const verifyHostel = async () => {
      try {
        const data = await hostelService.checkHostelAssignment();
        if (
          !(
            data.data.user.role === "student" ||
            data.data.user.role === "messManager" ||
            data.data.user.role === "hostelManager"
          )
        ) {
          toast.error("You are not authorized to access this page.");
          navigate("/admin/home");
        }
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
  }, [isAuthenticated, navigate]);

  // Fetch college and hostel/mess details using existing user data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !reduxUser) {
        return;
      }

      try {
        // Fetch college data
        const collegeRes = await api.get("/api/college/getCollege");
        setCollege(collegeRes.data.college);

        // Fetch hostel and mess details for the user's assigned hostel/mess
        const hmRes = await api.post("/api/hostel/getHostelMess");
        setHostelMess(hmRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, reduxUser]);

  if (loading || !reduxUser || !college || !hostelMess) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-blue-400 font-medium">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format user data for display cards
  const personalInfo = [
    {
      icon: <FaUser />,
      label: "Roll Number",
      value: reduxUser.rollNumber || "Not set",
    },
    {
      icon: <FaPhone />,
      label: "Phone",
      value: reduxUser.phoneNumber || "Not set",
    },
    {
      icon: <FaEnvelope />,
      label: "Email",
      value: reduxUser.email || "Not set",
    },
  ];

  const academicInfo = [
    {
      icon: <FaBuilding />,
      label: "College",
      value: college ? college.name : "Not set",
    },
    {
      icon: <FaGraduationCap />,
      label: "Branch",
      value: reduxUser.branch || "Not set",
    },
    {
      icon: <FaGraduationCap />,
      label: "Year",
      value: reduxUser.year ? `${reduxUser.year} Year` : "Not set",
    },
  ];

  const accommodationInfo = [
    {
      icon: <FaBuilding />,
      label: "Hostel",
      value: hostelMess?.hostel?.name || "Not assigned",
    },
    {
      icon: <FaHome />,
      label: "Mess",
      value: hostelMess?.mess?.name || "Not assigned",
    },
    {
      icon: <FaDoorOpen />,
      label: "Room",
      value: reduxUser.room || "Not assigned",
    },
  ];

  let role = "Student";
  if (reduxUser.role === "messManager") role = "Mess Manager";
  if (reduxUser.role === "hostelManager") role = "Hostel Manager";

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        {/* Profile header with backdrop */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-600 opacity-10 rounded-lg"></div>
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-center">
            {/* Profile picture */}
            <div className="mb-6 md:mb-0 md:mr-8">
              {reduxUser.profilePicture ? (
                <img
                  src={reduxUser.profilePicture}
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-blue-500 shadow-lg">
                  <FaUser size={70} className="text-blue-400" />
                </div>
              )}
            </div>

            {/* Profile title */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                {reduxUser.name}
              </h1>
              <p className="text-lg text-gray-300 mt-2">{role}</p>
              <button
                onClick={() => navigate("/student/update-profile")}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaEdit className="mr-2" /> Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Information cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <InfoCard title="Personal Information" items={personalInfo} />

          {/* Academic Information Card */}
          <InfoCard title="Academic Information" items={academicInfo} />

          {/* Accommodation Information Card */}
          <InfoCard title="Accommodation" items={accommodationInfo} />
        </div>
      </div>
    </div>
  );
};

// Reusable Info Card Component
const InfoCard = ({ title, items }) => (
  <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700">
    <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-gray-700">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <div className="p-5 space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="text-blue-400 w-6">{item.icon}</div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm">{item.label}</p>
            <p className="text-white font-medium">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProfilePage;
