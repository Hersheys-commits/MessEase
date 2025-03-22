import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";

const StudentElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyHostel = async () => {
      try {
        const data = await hostelService.checkHostelAssignment();
        if (data.data.user.role === "student" && !data.data.user.hostel) {
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
    const fetchElections = async () => {
      try {
        const response = await api.get("/api/election/getElections");
        setElections(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch elections"
        );
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  // Helper function to determine the status of the election
  const getElectionStatus = (election) => {
    if (election.applicationPhase.isOpen) {
      return {
        status: "Application Phase",
        color: "bg-blue-900 text-blue-300",
      };
    } else if (election.votingPhase.isOpen) {
      return { status: "Voting Phase", color: "bg-green-900 text-green-300" };
    } else if (election.result && election.result.announcedAt) {
      return {
        status: "Results Announced",
        color: "bg-purple-900 text-purple-300",
      };
    } else {
      return { status: "Pending", color: "bg-gray-700 text-gray-300" };
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // Group elections by type for better organization
  const messElections = elections.filter(
    (election) => election.type === "messManager"
  );
  const hostelElections = elections.filter(
    (election) => election.type === "hostelManager"
  );

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-blue-400">
          My Elections
        </h1>

        {elections.length === 0 ? (
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 text-center border border-gray-700">
            <p className="text-gray-400">
              No active or completed elections found for your mess or hostel.
            </p>
          </div>
        ) : (
          <>
            {/* Mess Elections Section */}
            {messElections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-blue-300">
                  Mess Elections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messElections.map((election) => {
                    const { status, color } = getElectionStatus(election);
                    return (
                      <ElectionCard
                        key={election._id}
                        election={election}
                        status={status}
                        statusColor={color}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hostel Elections Section */}
            {hostelElections.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-300">
                  Hostel Elections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostelElections.map((election) => {
                    const { status, color } = getElectionStatus(election);
                    return (
                      <ElectionCard
                        key={election._id}
                        election={election}
                        status={status}
                        statusColor={color}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Election Card Component
const ElectionCard = ({ election, status, statusColor, formatDate }) => {
  return (
    <div>
      {/* <Header/> */}
      <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition duration-300">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-blue-300">
              {election.type === "messManager"
                ? "Mess Manager"
                : "Hostel Manager"}{" "}
              Election
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
            >
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {election?.name || "Loading..."}
          </p>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-1">
              Application Phase
            </h4>
            <div className="text-xs text-gray-400">
              {election.applicationPhase.isOpen ? (
                <p className="text-green-400 font-medium">Open Now!</p>
              ) : (
                <p>Closed</p>
              )}
              <p>Opened: {formatDate(election.applicationPhase.openedAt)}</p>
              {election.applicationPhase.closedAt && (
                <p>Closed: {formatDate(election.applicationPhase.closedAt)}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-1">
              Voting Phase
            </h4>
            <div className="text-xs text-gray-400">
              {election.votingPhase.isOpen ? (
                <p className="text-green-400 font-medium">Open Now!</p>
              ) : (
                <p>
                  {election.votingPhase.openedAt ? "Closed" : "Not started yet"}
                </p>
              )}
              {election.votingPhase.openedAt && (
                <p>Opened: {formatDate(election.votingPhase.openedAt)}</p>
              )}
              {election.votingPhase.closedAt && (
                <p>Closed: {formatDate(election.votingPhase.closedAt)}</p>
              )}
            </div>
          </div>

          {election.result && election.result.announcedAt && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-1">
                Results
              </h4>
              <div className="text-xs text-gray-400">
                <p>Announced: {formatDate(election.result.announcedAt)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-750 border-t border-gray-700">
          {election.applicationPhase.isOpen && (
            <Link
              to={`/student/election/${election._id}/form`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 transition duration-200"
            >
              Apply Now
            </Link>
          )}

          {election.votingPhase.isOpen && (
            <Link
              to={`/student/election/${election._id}/voting`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-2 transition duration-200"
            >
              Vote Now
            </Link>
          )}

          {election.result && election.result.announcedAt && (
            <Link
              to={`/student/election/${election._id}/results`}
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-200"
            >
              View Results
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentElectionsPage;
