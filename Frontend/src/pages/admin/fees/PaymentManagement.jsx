import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosRequest";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import {
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const PaymentManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all hostels and payments in parallel
        const [hostelsResponse, paymentsResponse] = await Promise.all([
          api.post("/api/hostel/fetchAllHostels"),
          api.get("/api/payment/all"),
        ]);

        setHostels(hostelsResponse.data.hostels || []);
        setPayments(paymentsResponse.data.data || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePaymentStatus = async (paymentId) => {
    try {
      const response = await api.patch(`/api/payment/toggle/${paymentId}`);

      if (response.data.success) {
        // Update payments state with toggled status
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment._id === paymentId
              ? { ...payment, isActive: !payment.isActive }
              : payment
          )
        );

        toast.success(
          `Payment ${response.data.data.isActive ? "enabled" : "disabled"} successfully`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle payment status");
    }
  };

  // New function to delete a payment
  const deletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;

    try {
      const response = await api.delete(`/api/payment/delete/${paymentId}`);
      if (response.data.success) {
        // Remove the deleted payment from state
        setPayments((prevPayments) =>
          prevPayments.filter((payment) => payment._id !== paymentId)
        );
        toast.success("Payment deleted successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment");
    }
  };

  // Find payment for a hostel
  const findPaymentForHostel = (hostelId) => {
    return payments.find((payment) => payment.hostelId._id === hostelId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-center p-5 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <AdminHeader />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hostel Fee Payment Management</h1>
        </div>

        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Hostel Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {hostels.map((hostel) => {
                const payment = findPaymentForHostel(hostel._id);

                return (
                  <tr key={hostel._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        {hostel.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment ? (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
                        >
                          {payment.isActive ? "Enabled" : "Disabled"}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-300">
                          Not Configured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {payment ? `₹${payment.amount}` : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {payment && payment.dueDate
                          ? new Date(payment.dueDate).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {payment ? (
                          <>
                            <button
                              onClick={() => togglePaymentStatus(payment._id)}
                              className={`p-1 rounded ${payment.isActive ? "text-green-400 hover:text-green-200" : "text-red-400 hover:text-red-200"}`}
                              title={
                                payment.isActive
                                  ? "Disable Payment"
                                  : "Enable Payment"
                              }
                            >
                              {payment.isActive ? (
                                <FaToggleOn size={20} />
                              ) : (
                                <FaToggleOff size={20} />
                              )}
                            </button>
                            <Link
                              to={`/admin/payment/edit/${payment._id}/${hostel.code}`}
                              className="text-indigo-400 hover:text-indigo-200 p-1 rounded"
                              title="Edit Payment"
                            >
                              <FaEdit size={18} />
                            </Link>
                            <Link
                              to={`/admin/payment/paid-users/${payment._id}`}
                              className="text-blue-400 hover:text-blue-200 p-1 rounded"
                              title="View Paid Users"
                            >
                              <FaEye size={18} />
                            </Link>
                            <button
                              onClick={() => deletePayment(payment._id)}
                              className="text-red-400 hover:text-red-200 p-1 rounded"
                              title="Delete Payment"
                            >
                              <FaTrash size={18} />
                            </button>
                          </>
                        ) : (
                          <Link
                            to={`/admin/payment/create/${hostel.code}`}
                            className="text-green-400 hover:text-green-200 p-1 rounded"
                            title="Create Payment"
                          >
                            <FaPlus size={18} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
