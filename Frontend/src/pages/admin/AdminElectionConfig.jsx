import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { toast } from "react-toastify";
import AdminHeader from "../../components/AdminHeader";

const AdminElectionConfig = () => {
  const [hostels, setHostels] = useState([]);
  const [messes, setMesses] = useState([]);
  const [electionConfigs, setElectionConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "messManager",
    targetId: "",
    questions: [
      "Why do you want to be a manager?",
      "What are your past experiences?",
      "What changes would you implement?",
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelsRes, messesRes, configsRes] = await Promise.all([
          api.post("/api/hostel/fetchAllHostels"),
          api.post("/api/mess/fetchAllMesses"),
          api.get("/api/election/admin/elections"),
        ]);

        setHostels(hostelsRes.data.hostels);
        setMesses(messesRes.data.data);
        setElectionConfigs(configsRes.data.data);

        if (formData.type === "messManager" && messesRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            targetId: messesRes.data.data[0]._id,
          }));
        } else if (
          formData.type === "hostelManager" &&
          hostelsRes.data.hostels.length > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            targetId: hostelsRes.data.hostels[0]._id,
          }));
        }

        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      targetId:
        newType === "messManager" && messes.length > 0
          ? messes[0]._id
          : newType === "hostelManager" && hostels.length > 0
            ? hostels[0]._id
            : "",
    }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({ ...prev, questions: [...prev.questions, ""] }));
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/election/admin/elections", formData);
      toast.success("Election configuration created successfully");

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create election configuration"
      );
    }
  };

  const handleToggleApplicationPhase = async (id) => {
    try {
      await api.patch(`/api/election/admin/${id}/toggle-application`);

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);

      toast.success("Application phase toggled successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle application phase"
      );
    }
  };

  const handleToggleVotingPhase = async (id) => {
    try {
      await api.patch(`/api/election/admin/${id}/toggle-voting`);

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);

      toast.success("Voting phase toggled successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle voting phase"
      );
    }
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
        <h1 className="text-3xl font-bold mb-6 text-center">
          Election Configuration
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create New Election Form */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Create New Election</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Election Type
                </label>
                <select
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="messManager">Mess Manager</option>
                  <option value="hostelManager">Hostel Manager</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  {formData.type === "messManager" ? "Mess" : "Hostel"}
                </label>
                <select
                  value={formData.targetId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {formData.type === "messManager"
                    ? messes.map((mess) => (
                        <option key={mess._id} value={mess._id}>
                          {mess.name}
                        </option>
                      ))
                    : hostels.map((hostel) => (
                        <option key={hostel._id} value={hostel._id}>
                          {hostel.name}
                        </option>
                      ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Application Questions
                </label>

                {formData.questions.map((question, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Question ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  + Add Question
                </button>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Election
              </button>
            </form>
          </div>

          {/* Election List */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Existing Elections</h2>

            {electionConfigs.length === 0 ? (
              <p className="text-gray-400">No elections configured yet.</p>
            ) : (
              <div className="space-y-4">
                {electionConfigs.map((config) => (
                  <div
                    key={config._id}
                    className="border border-gray-700 p-4 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {config.type === "messManager"
                            ? "Mess Manager"
                            : "Hostel Manager"}
                          : {config.targetId?.name || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created: {new Date(config.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() =>
                            handleToggleApplicationPhase(config._id)
                          }
                          className={`px-3 py-1 text-xs rounded focus:outline-none focus:ring-2 ${
                            config.applicationPhase.isOpen
                              ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400"
                              : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400"
                          }`}
                        >
                          {config.applicationPhase.isOpen
                            ? "Close Applications"
                            : "Open Applications"}
                        </button>

                        <button
                          onClick={() => handleToggleVotingPhase(config._id)}
                          className={`px-3 py-1 text-xs rounded focus:outline-none focus:ring-2 ${
                            config.votingPhase.isOpen
                              ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400"
                              : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400"
                          }`}
                          disabled={
                            config.applicationPhase.isOpen ||
                            config.votingPhase.candidates.length === 0
                          }
                        >
                          {config.votingPhase.isOpen
                            ? "Close Voting"
                            : "Open Voting"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-gray-400">
                      <p className="text-sm">
                        <span className="font-medium">Application Status:</span>{" "}
                        {config.applicationPhase.isOpen ? "Open" : "Closed"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Voting Status:</span>{" "}
                        {config.votingPhase.isOpen ? "Open" : "Closed"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Candidates:</span>{" "}
                        {config.votingPhase.candidates.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Result:</span>{" "}
                        {config.result?.winnerId ? "Announced" : "Pending"}
                      </p>
                    </div>

                    <div className="mt-3 flex">
                      <a
                        href={`/admin/election/${config._id}/applications`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View Applications
                      </a>
                      <a
                        href={`/admin/election/${config._id}/results`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View Results
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionConfig;
