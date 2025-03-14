import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function BookRooms() {
  const location = useLocation();
  const navigate = useNavigate();
  const { availableRooms, checkInDate, checkOutDate } = location.state || {};

  const [selectedRoom, setSelectedRoom] = useState("");

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
  };

  const handleSubmit = async () => {
    if (!selectedRoom) {
      alert("Please select a room!");
      return;
    }
    console.log(selectedRoom,checkInDate,checkOutDate);
    // return ;
    // send userID with the use of redux
    try {
      const response = await axios.post("http://localhost:4001/api/guest/book-guest-room", {
        roomNumber: selectedRoom,
        checkInDate,
        checkOutDate,
      });

      if (response.status === 200) {
        alert("Room booked successfully!");
        navigate("/"); // Redirect back to home
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book the room. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold mb-4 text-center">Select a Guest Room</h2>
  
      {availableRooms.length === 0 ? (
        <p className="text-red-500">No rooms available.</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2 justify-center">
          {availableRooms.map((room) => (
            <li
              key={room}
              onClick={() => handleRoomSelection(room)}
              className={`w-40 h-15 flex items-center justify-center border rounded cursor-pointer text-center text-lg font-semibold
              ${selectedRoom === room ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            >
              Room {room}
            </li>
          ))}
        </ul>
      )}
  
      <button
        onClick={handleSubmit}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        Confirm Booking
      </button>
    </div>
  </div>
  
  
  );
}

export default BookRooms;
