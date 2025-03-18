import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosRequest";
import Header from "../../components/Header";

const AdminHome = () => {
  const [college, setCollege] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [collegeExists, setCollegeExists] = useState(false);
  const [requestPending, setRequestPending] = useState(false);

  useEffect(() => {
    const fetchCollegeAndHostels = async () => {
      try {
        // Fetch college details
        const collegeResponse = await api.post(`/api/admin/college`);
        console.log("College response:", collegeResponse);

        if (collegeResponse.status === 200) {
          setCollege(collegeResponse.data.college);
          setCollegeExists(true);

          // If college exists, fetch its hostels
          try {
            const hostelsResponse = await api.post(
              `/api/hostel/fetchAllHostels/${collegeResponse.data.college._id}`
            );
            console.log("Hostels response:", hostelsResponse);
            setHostels(hostelsResponse.data.hostels || []);

            // Fetch messes
            const messesResponse = await api.post(`/api/mess/fetchAllMesses`);
            console.log("Messes response:", messesResponse);
            setMesses(messesResponse.data.data || []);
          } catch (error) {
            console.error("Error fetching hostels or messes:", error);
            toast.error("Error fetching data");
          }
        } else if (collegeResponse.status === 207) {
          setRequestPending(true);
        }
      } catch (error) {
        console.error("Error fetching college:", error);
        toast.error("Error fetching college details");
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeAndHostels();
  }, []);

  const handleHostelClick = (hostelCode) => {
    navigate(`/admin/hostel/${hostelCode}`);
  };

  const handleMessClick = (messCode) => {
    navigate(`/admin/mess/${messCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100">
        {collegeExists ? (
          <div className="p-8">
            {/* College Info Card at the top */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-3xl font-bold mb-4 text-indigo-700">
                {college.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    College Details
                  </h2>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <span className="font-medium">Domain:</span>{" "}
                      {college.domain}
                    </p>
                    <p>
                      <span className="font-medium">Website:</span>{" "}
                      {college.website}
                    </p>
                    <p>
                      <span className="font-medium">Contact Email:</span>{" "}
                      {college.contactEmail}
                    </p>
                    <p>
                      <span className="font-medium">Contact Phone:</span>{" "}
                      {college.contactPhone}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Address
                  </h2>
                  <div className="space-y-2 text-gray-600">
                    <p>{college.address.street}</p>
                    <p>
                      {college.address.city}, {college.address.state}
                    </p>
                    <p>
                      {college.address.pincode}, {college.address.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hostels Section */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Hostels</h2>
              <Link to="/admin/create-hostel">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Hostel
                </button>
              </Link>
            </div>

            {/* Hostels Grid */}
            {hostels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <div
                    key={hostel._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleHostelClick(hostel.code)}
                  >
                    <div className="bg-indigo-600 rounded-t-lg h-3"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">
                        {hostel.name}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-indigo-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {hostel.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No hostels found for this college.
                </p>
                <Link to="/admin/create-hostel">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                    Create Your First Hostel
                  </button>
                </Link>
              </div>
            )}

            {/* Messes Section */}
            <div className="mt-12 mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Messes</h2>
              <Link to="/admin/create-mess">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Mess
                </button>
              </Link>
            </div>

            {/* Messes Grid */}
            {messes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {messes.map((mess) => (
                  <div
                    key={mess._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleMessClick(mess.code)}
                  >
                    <div className="bg-orange-500 rounded-t-lg h-3"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">
                        {mess.name}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        {mess.location || "Location not specified"}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-500">
                          Capacity: {mess.capacity}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {mess.code}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No messes found for this college.
                </p>
                <Link to="/admin/create-mess">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                    Create Your First Mess
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            {requestPending ? (
              <div className="text-center p-8">
                <div className="mb-4 text-amber-600 text-xl font-semibold">
                  Your college registration request is pending approval
                </div>
                <button className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 cursor-not-allowed">
                  Request Pending
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="mb-4 text-gray-600">
                  You need to create a college before adding hostels
                </div>
                <Link to="/admin/college/create">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                    Create College
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
