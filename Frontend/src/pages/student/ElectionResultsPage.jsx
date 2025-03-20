import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import hostelService from "../../utils/hostelCheck";

const ElectionResultsPage = () => {
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const fetchResults = async () => {
      try {
        // Get election details
        const electionResponse = await api.get(`/api/election/${electionId}`);
        setElection(electionResponse.data.data);

        // Get results
        const resultsResponse = await api.get(
          `/api/election/${electionId}/results`
        );
        setResults(resultsResponse.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch election results"
        );
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  const getWinner = () => {
    return results.find((result) => result.isWinner);
  };

  const getTotalVotes = () => {
    return results.reduce((sum, result) => sum + result.voteCount, 0);
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

  if (!election || !results.length) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Results are not available
            </h2>
            <p className="text-gray-300 mb-6">
              The results for this election have not been announced yet.
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

  const winner = getWinner();
  const totalVotes = getTotalVotes();

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Election Results:{" "}
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
              Results announced on:{" "}
              {election.result?.announcedAt
                ? new Date(election.result.announcedAt).toLocaleString()
                : "N/A"}
            </p>
            <p className="text-gray-300">Total votes cast: {totalVotes}</p>
          </div>

          {winner && (
            <div className="bg-gray-700 border border-green-800 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-green-400 text-center">
                Winner
              </h3>
              <div className="mt-4 text-center">
                <h4 className="text-lg font-semibold text-white">
                  {winner.candidate.name}
                </h4>
                <p className="text-gray-300">
                  Branch: {winner.candidate.branch}
                </p>
                <p className="text-gray-300">Year: {winner.candidate.year}</p>
                <p className="mt-2 text-xl font-bold text-green-400">
                  {winner.voteCount} votes (
                  {((winner.voteCount / totalVotes) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">
              All Results:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2 text-left border border-gray-600">
                      Rank
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-600">
                      Candidate
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-600">
                      Branch
                    </th>
                    <th className="px-4 py-2 text-left border border-gray-600">
                      Year
                    </th>
                    <th className="px-4 py-2 text-right border border-gray-600">
                      Votes
                    </th>
                    <th className="px-4 py-2 text-right border border-gray-600">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result.candidate._id}
                      className={`border-b border-gray-600 ${
                        result.isWinner ? "bg-green-900 bg-opacity-30" : ""
                      }`}
                    >
                      <td className="px-4 py-2 border border-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 font-semibold border border-gray-600">
                        {result.candidate.name}
                        {result.isWinner && " (Winner)"}
                      </td>
                      <td className="px-4 py-2 border border-gray-600">
                        {result.candidate.branch}
                      </td>
                      <td className="px-4 py-2 border border-gray-600">
                        {result.candidate.year}
                      </td>
                      <td className="px-4 py-2 text-right border border-gray-600">
                        {result.voteCount}
                      </td>
                      <td className="px-4 py-2 text-right border border-gray-600">
                        {((result.voteCount / totalVotes) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/student/home")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionResultsPage;
