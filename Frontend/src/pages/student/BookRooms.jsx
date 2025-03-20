import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";
import toast from "react-hot-toast";

function BookRooms() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    availableRooms = [],
    checkInDate,
    checkOutDate,
    userId,
  } = location.state || {};
  console.log("Available rooms state:", location.state);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
  };

  const handleSubmit = async () => {
    if (!selectedRoom) {
      alert("Please select a room!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4001/api/guest/book-guest-room",
        {
          roomNumber: selectedRoom,
          checkInDate,
          checkOutDate,
          userId,
        }
      );
      if (response.status === 200) {
        alert("Room booked successfully!");
        navigate("/student/home");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book the room. Please try again.");
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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Select a Guest Room
        </h2>
        {availableRooms.length === 0 ? (
          <p className="text-red-500 text-center">No rooms available.</p>
        ) : (
          <ul className="mb-4 flex flex-wrap gap-2 justify-center">
            {availableRooms.map((room) => (
              <li
                key={room}
                onClick={() => handleRoomSelection(room)}
                className={`w-40 h-12 flex items-center justify-center border rounded cursor-pointer text-center text-lg font-semibold transition duration-200 ${
                  selectedRoom === room
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Room {room}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

export default BookRooms;
