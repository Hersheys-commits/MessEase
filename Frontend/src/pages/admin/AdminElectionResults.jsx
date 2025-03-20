// pages/AdminElectionResults.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminHeader from "../../components/AdminHeader";

const AdminElectionResults = () => {
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { electionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const electionResponse = await api.get(`/api/election/${electionId}`);
        setElection(electionResponse.data.data);

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

  const getWinner = () => results.find((result) => result.isWinner);
  const getTotalVotes = () =>
    results.reduce((sum, result) => sum + result.voteCount, 0);

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

  if (!election || !results.length) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeader />
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500">
            Results are not available
          </h2>
          <p className="mt-4">
            The results for this election have not been announced yet.
          </p>
          <button
            onClick={() => navigate("/admin/election")}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const winner = getWinner();
  const totalVotes = getTotalVotes();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Election Results - Admin Overview
        </h1>

        <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
          <h2 className="font-semibold text-xl mb-2">Election Details</h2>
          <p className="text-gray-300">
            <strong>Type:</strong>{" "}
            {election.type === "messManager"
              ? "Mess Manager"
              : "Hostel Manager"}
          </p>
          <p className="text-gray-300">
            <strong>Target:</strong> {election.targetId?.name || "N/A"}
          </p>
          <p className="text-gray-300">
            <strong>College:</strong> {election.college?.name || "N/A"}
          </p>
          <p className="text-gray-300">
            <strong>Created:</strong>{" "}
            {new Date(election.createdAt).toLocaleString()}
          </p>
          <p className="text-gray-300">
            <strong>Results Announced:</strong>{" "}
            {election.result?.announcedAt
              ? new Date(election.result.announcedAt).toLocaleString()
              : "N/A"}
          </p>
          <p className="text-gray-300">
            <strong>Total Votes Cast:</strong> {totalVotes}
          </p>
          <p className="text-gray-300">
            <strong>Total Candidates:</strong> {results.length}
          </p>
        </div>

        {winner && (
          <div className="bg-green-900 border border-green-700 p-6 rounded-lg mb-8">
            <h3 className="text-2xl font-semibold text-green-300 text-center">
              Winner Details
            </h3>
            <div className="mt-4 text-center">
              <h4 className="text-xl font-semibold">{winner.candidate.name}</h4>
              <p className="text-gray-300">Email: {winner.candidate.email}</p>
              <p className="text-gray-300">Branch: {winner.candidate.branch}</p>
              <p className="text-gray-300">Year: {winner.candidate.year}</p>
              <p className="mt-2 text-xl font-bold text-green-400">
                {winner.voteCount} votes (
                {((winner.voteCount / totalVotes) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Detailed Candidate Results
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Candidate Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-right">Votes</th>
                  <th className="px-4 py-3 text-right">Percentage</th>
                  <th className="px-4 py-3 text-left">Application Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {results.map((result, index) => (
                  <tr
                    key={result.candidate._id}
                    className={`${result.isWinner ? "bg-green-900" : ""}`}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold">
                      {result.candidate.name}{" "}
                      {result.isWinner && <span>(Winner)</span>}
                    </td>
                    <td className="px-4 py-3">{result.candidate.email}</td>
                    <td className="px-4 py-3">{result.candidate.branch}</td>
                    <td className="px-4 py-3">{result.candidate.year}</td>
                    <td className="px-4 py-3 text-right">{result.voteCount}</td>
                    <td className="px-4 py-3 text-right">
                      {((result.voteCount / totalVotes) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {result.applicationStatus || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionResults;
