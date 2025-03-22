import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import {
  FaBan,
  FaUnlock,
  FaUser,
  FaGraduationCap,
  FaDoorOpen,
  FaCodeBranch,
  FaCalendarAlt,
  FaBuilding,
  FaSchool,
  FaUserTag,
  FaUserLock,
} from "react-icons/fa";
import toast from "react-hot-toast";

const StudentProfilePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Fetch student details
  const fetchStudent = async () => {
    try {
      const res = await api.get(`/api/admin/students/${id}`);
      setStudent(res.data.data);
    } catch (err) {
      console.error("Error fetching student details:", err);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle block toggle
  const toggleBlock = async () => {
    if (!student) return;
    setToggleLoading(true);
    try {
      const payload = {
        isBlocked: !student.isBlocked,
      };
      const res = await api.put(
        `/api/admin/students/${id}/toggle-block`,
        payload
      );
      setStudent(res.data.data);
      toast.success(
        `Student ${student.isBlocked ? "unblocked" : "blocked"} successfully`
      );
    } catch (err) {
      console.error("Error toggling block status:", err);
      toast.error("Failed to update student status");
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
            <div className="text-xl font-semibold">Loading student data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        {/* Back button */}
        <Link
          to="/admin/students"
          className="inline-flex items-center text-gray-400 hover:text-indigo-400 mb-6 transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Student List
        </Link>

        {/* Student Profile Card */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-indigo-400">
              {student.name || "N/A"}
            </h1>
            <div
              className={`mt-3 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold ${
                student.isBlocked
                  ? "bg-red-900 text-red-300"
                  : "bg-green-900 text-green-300"
              }`}
            >
              {student.isBlocked ? "Blocked" : "Active"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-gray-750 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center">
                <FaUser className="mr-2 text-indigo-400" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUser className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Full Name</p>
                    <p className="text-gray-200">{student.name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaGraduationCap className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Roll Number</p>
                    <p className="text-gray-200">
                      {student.rollNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaUserTag className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-gray-200">{student.role || "Student"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-gray-750 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center">
                <FaGraduationCap className="mr-2 text-indigo-400" />
                Academic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaCodeBranch className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Branch</p>
                    <p className="text-gray-200">{student.branch || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCalendarAlt className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Year</p>
                    <p className="text-gray-200">{student.year || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaSchool className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">College</p>
                    <p className="text-gray-200">
                      {student.college && student.college.name
                        ? student.college.name
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation Information */}
            <div className="bg-gray-750 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center">
                <FaDoorOpen className="mr-2 text-indigo-400" />
                Accommodation
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaBuilding className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Hostel</p>
                    <p className="text-gray-200">
                      {student.hostel && student.hostel.name
                        ? student.hostel.name
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaDoorOpen className="mt-1 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Room</p>
                    <p className="text-gray-200">{student.room || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Controls */}
            <div className="bg-gray-750 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-300 flex items-center">
                <FaUserLock className="mr-2 text-indigo-400" />
                Status & Controls
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div
                    className={`mt-1 mr-3 ${student.isBlocked ? "text-red-500" : "text-green-500"}`}
                  >
                    {student.isBlocked ? <FaBan /> : <FaUnlock />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Status</p>
                    <p
                      className={`${student.isBlocked ? "text-red-400" : "text-green-400"}`}
                    >
                      {student.isBlocked ? "Blocked" : "Active"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleBlock}
                  disabled={toggleLoading}
                  className={`mt-4 w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                    student.isBlocked
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-red-700 hover:bg-red-800"
                  } text-white transition duration-200`}
                >
                  {toggleLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {student.isBlocked ? (
                        <>
                          <FaUnlock className="mr-2" /> Unblock Student
                        </>
                      ) : (
                        <>
                          <FaBan className="mr-2" /> Block Student
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
