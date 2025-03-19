import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios"

export const BookedRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // Track which booking is being canceled
  const location = useLocation();
  const userId = location.state?.userId; // Retrieve userId from navigation state
  // console.log("userId from student-home",userId);
  useEffect(() => {
    const fetchBookedRooms = async () => {
        try {
              const response = await axios.get(`http://localhost:4001/api/guest/booked-guest-rooms?userId=${userId}`);
          console.log(response.data);
          setBookedRooms(response.data);
        } catch (error) {
          console.error("Error fetching booked rooms:", error);
        }
      };

      fetchBookedRooms();

    // // const fakeData = [
    // //   {
    // //     id: 1,
    // //     roomName: "Deluxe Suite",
    // //     checkIn: "2025-03-20",
    // //     checkOut: "2025-03-25",
    // //   },
    // //   {
    // //     id: 2,
    // //     roomName: "Ocean View Room",
    // //     checkIn: "2025-04-05",
    // //     checkOut: "2025-04-10",
    // //   },
    // //   {
    // //     id: 3,
    // //     roomName: "Penthouse",
    // //     checkIn: "2025-05-01",
    // //     checkOut: "2025-05-07",
    // //   },
    // // ];

    // setBookedRooms(fakeData);
  }, []);

  const handleCancelBooking = async (id) => {
    setLoadingId(id);

    try {
      //   await axios.delete(`http://localhost:4001/api/guest/cancel-booking`, {
      //     data: { userId, bookingId: id },
      //   });

      setBookedRooms((prevRooms) => prevRooms.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setLoadingId(null);
    }
  };
  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Booked Rooms
      </h2>
      {bookedRooms?.length === 0 ? (
        <p className="text-gray-500 text-center">No rooms booked yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookedRooms?.map((room) => (
            <li
              key={room._id}
              className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {room.roomNumber}
                </h3>
                <p className="text-gray-600">
                  <span className="font-medium">Check-In:</span>{" "}
                  {new Date(room.checkInDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Check-Out:</span>{" "}
                  {new Date(room.checkOutDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleCancelBooking(room._id)}
                disabled={loadingId === room.id}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  loadingId === room.id
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {loadingId === room.id ? "Canceling..." : "Cancel"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
