// src/pages/HomePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin/signup'); // Redirect to admin signup page
  };

  const handleStudentClick = () => {
    navigate('/student/signup'); // Redirect to student signup page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h1 className="text-3xl font-semibold mb-6">Welcome to Our Platform</h1>
        
        <p className="text-lg mb-4">Are you a College Admin or a College Student?</p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={handleAdminClick}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            College Admin
          </button>
          <button
            onClick={handleStudentClick}
            className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-200"
          >
            College Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
