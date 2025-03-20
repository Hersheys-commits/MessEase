import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate("/admin/signup");
  };

  const handleStudentClick = () => {
    navigate("/student/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 bg-opacity-80 p-10 rounded-xl shadow-xl max-w-lg w-full text-center backdrop-blur-lg border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
          Welcome to Our Platform
        </h1>

        <p className="text-lg text-gray-300 mb-6">
          Are you a College Admin or a College Student?
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleAdminClick}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
          >
            College Admin
          </button>
          <button
            onClick={handleStudentClick}
            className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
          >
            College Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
