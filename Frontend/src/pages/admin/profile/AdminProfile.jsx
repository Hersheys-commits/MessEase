// src/pages/admin/Profile.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosRequest";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaEdit,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdVerified, MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbSchool } from "react-icons/tb";
import { toast } from "react-toastify";
import AdminHeader from "../../../components/AdminHeader";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/profile");
        setProfile(response.data.data.user);
        setCollege(response.data.data.collegeDetails);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        toast.error(error.response?.data?.message || "Failed to fetch profile");
        if (error.response?.status === 403) {
          navigate("/admin/home");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <MdOutlineAdminPanelSettings
              className="mr-2 text-blue-400"
              size={30}
            />
            Admin Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Profile Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-blue-500">
                      <FaUser className="text-gray-400" size={50} />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mt-4">
                    {profile?.name || "Admin User"}
                  </h2>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm mt-2">
                    {profile?.role}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-400 mr-3" />
                    <span>{profile?.email}</span>
                  </div>

                  {profile?.phoneNumber && (
                    <div className="flex items-center">
                      <FaPhone className="text-blue-400 mr-3" />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}

                  {profile?.lastLogin && (
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm">
                        Last Login:{" "}
                        {new Date(profile.lastLogin).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to="/admin/update-profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center w-full"
                  >
                    <FaEdit className="mr-2" />
                    Update Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* College Information Card */}
            {college ? (
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <TbSchool className="mr-2 text-blue-400" size={24} />
                      College Information
                    </h2>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          college.status === "verified"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {college.status}
                        {college.status === "verified" && (
                          <MdVerified className="ml-1 inline" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-6">
                    {college.logo ? (
                      <img
                        src={college.logo}
                        alt={college.name}
                        className="h-24 object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center">
                        <FaBuilding className="text-gray-400" size={40} />
                      </div>
                    )}
                    <h3 className="text-xl font-bold mt-3">{college.name}</h3>
                    <span className="text-gray-400 text-sm">
                      Code: {college.code}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Domain: {college.domain}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {college.address && (
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-blue-400 mr-3 mt-1" />
                        <span>
                          {college.address.street}, {college.address.city},{" "}
                          {college.address.state}, {college.address.pincode},{" "}
                          {college.address.country}
                        </span>
                      </div>
                    )}

                    {college.contactEmail && (
                      <div className="flex items-center">
                        <FaEnvelope className="text-blue-400 mr-3" />
                        <span>{college.contactEmail}</span>
                      </div>
                    )}

                    {college.contactPhone && (
                      <div className="flex items-center">
                        <FaPhone className="text-blue-400 mr-3" />
                        <span>{college.contactPhone}</span>
                      </div>
                    )}

                    {college.website && (
                      <div className="flex items-center">
                        <FaGlobe className="text-blue-400 mr-3" />
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {college.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {profile?.role === "admin" && (
                    <div className="mt-6">
                      <Link
                        to="/admin/update-college"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center w-full"
                      >
                        <FaEdit className="mr-2" />
                        Update College
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <TbSchool className="mr-2 text-blue-400" size={24} />
                  College Information
                </h2>
                <p className="text-gray-400">
                  No college information associated with this account.
                </p>
              </div>
            )}
          </div>

          {/* Admin List Section (if needed) */}
          {college?.admins && college.admins.length > 0 && (
            <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MdOutlineAdminPanelSettings
                  className="mr-2 text-blue-400"
                  size={24}
                />
                College Administrators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {college.admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center"
                  >
                    {admin.profilePicture ? (
                      <img
                        src={admin.profilePicture}
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                        <FaUser className="text-gray-400" size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{admin.name}</h3>
                      <p className="text-sm text-gray-400">{admin.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
