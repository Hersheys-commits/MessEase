import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import api from "../../utils/axiosRequest";

function StudentHome() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post("/api/student/verify-token");
        console.log("data", res.data.user); // Log response (optional)
        setUserId(res.data.user);
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
      <div className="flex flex-col space-y-4 mt-4 items-start">
        <button
          onClick={() => navigate("/available-rooms", { state: { userId } })}
          className="px-4 py-2 bg-blue-500 text-white rounded-md w-auto"
        >
          Go to Available Rooms
        </button>
        <button
          onClick={() => navigate("/see-booking", { state: { userId } })}
          className="px-4 py-2 bg-blue-500 text-white rounded-md w-auto"
        >
          See Booked Guest Rooms
        </button>
      </div>
    </div>
  );
}

export default StudentHome;
