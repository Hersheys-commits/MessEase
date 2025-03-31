import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";
import toast from "react-hot-toast";

const BookedRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const location = useLocation();
  const userId = location.state?.userId;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchBookedRooms = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4001/api/guest/booked-guest-rooms?userId=${userId}`
        );
        console.log(response.data);
        setBookedRooms(response.data);
      } catch (error) {
        console.error("Error fetching booked rooms:", error);
      }
    };

    fetchBookedRooms();
  }, []);

  const handleCancelBooking = async (id) => {
    setLoadingId(id);
    console.log("ID", id);

    try {
      await axios.delete(`http://localhost:4001/api/guest/cancel-booking`, {
        data: { userId, bookingId: id },
      });

      console.log(bookedRooms);
      setBookedRooms((prevRooms) => {
        const updatedRooms = prevRooms.filter((room) => room._id !== id);
        return updatedRooms; // Return the updated rooms list
      });
      console.log(bookedRooms);
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setLoadingId(null);
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
    <div className="max-w-lg mx-auto bg-gray-800 shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">
        Booked Rooms
      </h2>
      {bookedRooms?.length === 0 ? (
        <p className="text-gray-400 text-center">No rooms booked yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookedRooms?.map((room) => (
            <li
              key={room._id}
              className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {room.roomNumber}
                </h3>
                <p className="text-gray-300">
                  <span className="font-medium">Check-In:</span>{" "}
                  {new Date(room.checkInDate).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Check-Out:</span>{" "}
                  {new Date(room.checkOutDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleCancelBooking(room._id)}
                disabled={loadingId === room.id}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  loadingId === room.id
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
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

export default BookedRooms;
