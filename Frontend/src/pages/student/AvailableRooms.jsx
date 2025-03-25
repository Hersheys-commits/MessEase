import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import hostelService from "../../utils/hostelCheck";
import toast from "react-hot-toast";

function AvailableRooms() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
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
  }, []);

  console.log("BOOKING PAGE USER: ", userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInDate) {
      setError("Check-in date is required!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4001/api/guest/see-availability",
        {
          userId,
          checkInDate,
          checkOutDate,
        }
      );
      console.log("Available room: ", response.data);
      const availableRooms = response.data.freeRooms;
      if (availableRooms.length === 0) {
        setError("No rooms available for the selected dates.");
        return;
      }
      navigate("/book-rooms", {
        state: { availableRooms, checkInDate, checkOutDate, userId },
      });
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setError("Failed to fetch available rooms. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-white">
            Book a Guest Room
          </h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <label className="block mb-2 text-white">Check-In Date:</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full border border-gray-600 p-2 rounded mb-4 bg-gray-700 text-white"
            required
          />
          <label className="block mb-2 text-white">Check-Out Date:</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full border border-gray-600 p-2 rounded mb-4 bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Check Availability
          </button>
        </form>
      </div>
    </div>
  );
}

export default AvailableRooms;
