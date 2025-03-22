import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaFileCsv, FaArrowLeft, FaUsers } from "react-icons/fa";
import api from "../../../utils/axiosRequest";
import { toast } from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";

const PaidUsersList = () => {
  const { paymentId } = useParams();
  const [paidUsers, setPaidUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaidUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/payment/paid-users/${paymentId}`);
        if (response.data.success) {
          setPaidUsers(response.data.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load paid users data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchPaidUsers();
  }, [paymentId]);

  const exportToCSV = () => {
    if (!paidUsers.length) return;

    const headers = [
      "Name",
      "Email",
      "Roll Number",
      "Paid Date",
      "Transaction ID",
    ];
    const csvData = paidUsers.map((item) => [
      item.userId?.name || "N/A",
      item.userId?.email || "N/A",
      item.userId?.rollNumber || "N/A",
      new Date(item.paidAt).toLocaleString(),
      item.transactionId || "N/A",
    ]);

    csvData.unshift(headers);
    const csvString = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `paid_users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file download started");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-700 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-white">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <AdminHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link to="/admin/payments" className="mr-4">
            <FaArrowLeft className="text-gray-300 hover:text-gray-100" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <FaUsers className="mr-2" />
            Paid Users List
          </h1>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={exportToCSV}
            disabled={!paidUsers.length}
            className={`flex items-center space-x-2 px-4 py-2 rounded font-bold transition-colors ${
              paidUsers.length
                ? "bg-green-600 hover:bg-green-500"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            <FaFileCsv />
            <span>Export to CSV</span>
          </button>
        </div>

        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
          {paidUsers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {paidUsers.map((paidUser, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {paidUser.userId?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {paidUser.userId?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {paidUser.userId?.rollNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(paidUser.paidAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {paidUser.transactionId || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-6 text-gray-400">
              No users have paid this fee yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaidUsersList;
