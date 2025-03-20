import React from "react";
import { Link } from "react-router-dom";
import { FaGhost } from "react-icons/fa";

function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-6">
      <FaGhost className="text-6xl text-red-500 animate-bounce" />
      <h1 className="text-5xl font-bold mt-4">404</h1>
      <p className="text-xl mt-2">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className="text-gray-400 mt-1">It might have been moved or removed.</p>
      <Link
        to="/student/home"
        className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-red-600 transition duration-300"
      >
        Return Home
      </Link>
    </div>
  );
}

export default PageNotFound;
