import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import api from "../../utils/axiosRequest";

function StudentHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post("/api/student/verify-token");
        console.log("data", res.data); // Log response (optional)
      } catch (error) {
        console.error("Error verifying token:", error);
        navigate("/student/login");
      }
    };

    verifyToken(); // Call the async function inside useEffect
  }, []);

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
