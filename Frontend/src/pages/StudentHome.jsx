import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function StudentHome() {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <button
        onClick={() => navigate("/available-rooms")}
        className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4"
      >
        Go to Available Rooms
      </button>
    </div>
  );
}

export default StudentHome;
