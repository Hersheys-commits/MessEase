import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ApplicationDetailModal from "../../components/admin/ApplicationDetailModal";
import AdminHeader from "../../components/AdminHeader";

const AdminApplicationReview = () => {
  const [election, setElection] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { electionId } = useParams();
  const navigate = useNavigate();

  // State for modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get election details and applications
        const [electionRes, applicationsRes] = await Promise.all([
          api.get(`/api/election/${electionId}`),
          api.get(`/api/election/admin/${electionId}/applications`),
        ]);

        setElection(electionRes.data.data);
        setApplications(applicationsRes.data.data);

        // Pre-select approved applications
        const approvedApplications = applicationsRes.data.data
          .filter((app) => app.status === "approved")
          .map((app) => app._id);

        setSelectedApplications(approvedApplications);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId]);

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app._id));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const res = await api.patch(
        `/api/election/admin/${electionId}/select-candidates`,
        {
          applicationIds: selectedApplications,
        }
      );
      //   console.log(res)
      if (res?.data?.phase) {
        toast.success(`${res.data.message}`);
      } else toast.success("Candidates selected successfully");
      navigate(`/admin/election`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to select candidates"
      );
      setSubmitting(false);
    }
  };

  // Function to open modal with application details
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Review Applications:{" "}
            {election.type === "messManager"
              ? "Mess Manager"
              : "Hostel Manager"}
          </h1>
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Back to Elections
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
          <h2 className="font-semibold text-lg">
            {election.type === "messManager" ? "Mess" : "Hostel"}:{" "}
            {election.targetId?.name || "N/A"}
          </h2>
          <p>Applications: {applications.length}</p>
          <p>
            Application Status:{" "}
            {election.applicationPhase.isOpen ? "Open" : "Closed"}
          </p>
          <p>
            Voting Status: {election.votingPhase.isOpen ? "Open" : "Closed"}
          </p>
        </div>

        <div className="bg-gray-800 shadow rounded-lg overflow-hidden mb-6 border border-gray-700">
          <div className="p-4 border-b bg-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Applications ({applications.length})
              </h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500"
                    checked={
                      selectedApplications.length === applications.length &&
                      applications.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <span className="ml-2 text-sm text-gray-300">Select All</span>
                </label>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No applications found for this election.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Select
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Roll Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Submitted On
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {applications.map((application) => (
                    <tr key={application._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500"
                          checked={selectedApplications.includes(
                            application._id
                          )}
                          onChange={() =>
                            handleSelectApplication(application._id)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {application.user?.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={application.user.profileImage}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-200">
                                {application.user?.name?.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">
                              {application.user?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {application.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          {application.user?.rollNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === "approved"
                              ? "bg-green-900 text-green-300"
                              : application.status === "rejected"
                                ? "bg-red-900 text-red-300"
                                : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 mr-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Save Selected Candidates"
            )}
          </button>
        </div>

        {/* Application Detail Modal */}
        {showModal && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminApplicationReview;
