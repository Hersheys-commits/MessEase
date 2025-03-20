import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";

const ApplicationForm = () => {
  const [election, setElection] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { electionId } = useParams();
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
    const fetchElectionDetails = async () => {
      try {
        const response = await api.get(`/api/election/${electionId}`);
        setElection(response.data.data);
        setAnswers(
          Array(response.data.data.applicationPhase.questions.length).fill("")
        );
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch election details"
        );
        setLoading(false);
      }
    };

    fetchElectionDetails();
  }, [electionId]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (answers.some((answer) => !answer.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/election/apply", {
        electionId,
        answers,
      });

      toast.success("Application submitted successfully");
      navigate("/student/home");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!election || !election.applicationPhase.isOpen) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Application is not available
            </h2>
            <p className="text-gray-300 mb-6">
              The application phase for this election is not currently open.
            </p>
            <button
              onClick={() => navigate("/student/home")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Apply for{" "}
            {election.type === "messManager"
              ? "Mess Manager"
              : "Hostel Manager"}
          </h1>

          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h2 className="font-semibold text-lg mb-2 text-indigo-300">
              {election.type === "messManager" ? "Mess" : "Hostel"}:{" "}
              {election.targetId?.name || "N/A"}
            </h2>
            <p className="text-gray-300">
              Applications close on:{" "}
              {election.applicationPhase.openedAt
                ? new Date(election.applicationPhase.openedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {election.applicationPhase.questions.map((question, index) => (
              <div key={index} className="mb-6">
                <label className="block text-gray-200 text-sm font-bold mb-2">
                  {question}
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-300"
                  rows={4}
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  required
                  placeholder="Type your answer here..."
                />
              </div>
            ))}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/student/home")}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
