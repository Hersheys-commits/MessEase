import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import {
  FaUser,
  FaBuilding,
  FaHome,
  FaDoorOpen,
  FaPhone,
  FaGraduationCap,
  FaUpload,
} from "react-icons/fa";
import Header from "../../components/Header";

const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = location.state?.redirect || "/student/home";
  const alertMessage = location.state?.message || "";

  const [user, setUser] = useState({
    name: "",
    branch: "",
    year: "",
    room: "",
    phoneNumber: "",
    hostel: "",
    profilePicture: "",
  });

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch user data and hostels
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const userResponse = await api.post("/api/student/verify-token");
        setUser({
          name: userResponse?.data?.userInfo?.name || "",
          branch: userResponse?.data?.userInfo?.branch || "",
          year: userResponse?.data?.userInfo?.year || "",
          room: userResponse?.data?.userInfo?.room || "",
          phoneNumber: userResponse?.data?.userInfo?.phoneNumber || "",
          hostel: userResponse?.data?.userInfo.hostel?._id || "",
          profilePicture: userResponse?.data?.userInfo?.profilePicture || "",
        });

        // Get hostels for the user's college
        const hostelResponse = await api.post("/api/hostel/fetchAllHostels");
        console.log("hostel", hostelResponse);
        setHostels(hostelResponse.data.hostels);
        setLoading(false);
      } catch (err) {
        console.log("hostel", err.response);
        setError(err.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preview profile picture
  useEffect(() => {
    if (!selectedFile) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length === 1) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // First update profile information
      const updateData = {
        name: user.name,
        branch: user.branch,
        year: parseInt(user.year),
        room: user.room,
        phoneNumber: user.phoneNumber,
        hostelId: user.hostel,
      };

      await api.patch("/api/student/update-profile", updateData);

      // Then upload profile picture if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("profilePicture", selectedFile);

        await api.post("/api/student/upload-profile-picture", formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        });
      }

      setSuccess("Profile updated successfully!");

      // Redirect after successful update if there was a redirect path
      if (location.state?.redirect) {
        setTimeout(() => navigate(redirectPath), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Update Profile
            </h2>

            {alertMessage && (
              <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 text-yellow-100 px-4 py-3 rounded mb-4">
                <p>{alertMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-100 px-4 py-3 rounded mb-4">
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="mb-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUser size={64} />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <label
                    htmlFor="profile-upload"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition"
                  >
                    <FaUpload className="mr-2" />
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full mt-2">
                    <div className="bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="mb-4">
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-300"
                >
                  Branch
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <select
                    id="branch"
                    name="branch"
                    value={user.branch}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="BT">Biotechnology</option>
                  </select>
                </div>
              </div>

              {/* Year */}
              <div className="mb-4">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-300"
                >
                  Year
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <select
                    id="year"
                    name="year"
                    value={user.year}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>
              </div>

              {/* Hostel - Required Field */}
              <div className="mb-4">
                <label
                  htmlFor="hostel"
                  className="block text-sm font-medium text-gray-300"
                >
                  Hostel <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <select
                    id="hostel"
                    name="hostel"
                    value={user.hostel}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                    required
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!user.hostel && (
                  <p className="mt-1 text-sm text-red-400">
                    You must select a hostel to access the student portal
                  </p>
                )}
              </div>

              {/* Room Number */}
              <div className="mb-4">
                <label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-300"
                >
                  Room Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDoorOpen className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    value={user.room}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                    placeholder="e.g. A-101"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleInputChange}
                    className="bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-600 rounded-md text-white"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
