import React, { useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AvailableRooms() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInDate) {
      setError("Check-in date is required!");
      return;
    }
    console.log(checkInDate,checkOutDate);
    console.log(typeof checkInDate);
    try {
      // send userId with this with the help of redux
      // const response = await axios.post("http://localhost:4001/api/guest/see-availability", {
      //   checkInDate,
      //   checkOutDate,
      // });
      const response={
        "hostel": "patel",
        "college": "MNNIT Allahabad",
        "freeRooms": [
            "G-1",
            "G-2",
            "G-3",
            "G-4",
            "G-5",
            "G-6",
            "G-7",
            "G-8",
            "G-9",
            "G-10",
            "G-11",
            "G-12",
            "G-13",
            "G-14",
            "G-15",
            "G-16",
            "G-17",
            "G-18",
            "G-19",
            "G-20"
        ]
    };
      console.log("Available room: ",response);
      // const availableRooms = response.data.freeRooms; // Get available rooms
      const availableRooms = response.freeRooms; // Get available rooms


      if (availableRooms.length === 0) {
        setError("No rooms available for the selected dates.");
        return;
      }

      // Navigate to the Available Rooms page with room data
      navigate("/available-rooms", { state: { availableRooms, checkInDate, checkOutDate } });
      
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setError("Failed to fetch available rooms. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Book a Guest Room</h2>

          {error && <p className="text-red-500">{error}</p>}

          <label className="block mb-2">Check-In Date:</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            required
          />

          <label className="block mb-2">Check-Out Date:</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Check Availability
          </button>
        </form>
      </div>
    </div>
  );
}

export default AvailableRooms;
