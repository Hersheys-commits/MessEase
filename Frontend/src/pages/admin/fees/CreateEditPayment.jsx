import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegEdit, FaPlusCircle } from "react-icons/fa";
import api from "../../../utils/axiosRequest";
import { toast } from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";

const CreateEditPayment = () => {
  const { hostelId, paymentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(paymentId);

  const [formData, setFormData] = useState({
    amount: "",
    title: "",
    description: "",
    dueDate: "",
    isActive: true,
  });

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedHostel = null;
        if (hostelId) {
          const hostelResponse = await api.get(`/api/hostel/${hostelId}`);
          fetchedHostel = hostelResponse.data.hostel;
          setHostel(fetchedHostel);
        }

        if (paymentId && fetchedHostel) {
          const paymentResponse = await api.get(
            `/api/payment/hostel/${fetchedHostel._id}`
          );
          const payment = paymentResponse.data.data;
          setFormData({
            amount: payment.amount,
            title: payment.title,
            description: payment.description || "",
            dueDate: payment.dueDate
              ? new Date(payment.dueDate).toISOString().split("T")[0]
              : "",
            isActive: payment.isActive,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hostelId, paymentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        hostelId: hostel._id,
      };

      const response = await api.post("/api/payment/create", payload);

      if (response.data.success) {
        toast.success(
          `Payment ${isEditMode ? "updated" : "created"} successfully`
        );
        navigate("/admin/payments");
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} payment`);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <AdminHeader />
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          {isEditMode ? (
            <FaRegEdit className="mr-2" />
          ) : (
            <FaPlusCircle className="mr-2" />
          )}
          {isEditMode ? "Edit Payment" : "Create New Payment"}
        </h1>

        {hostel && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
            <h2 className="font-semibold text-xl">Hostel: {hostel.name}</h2>
          </div>
        )}

        <div className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                className="block text-gray-300 text-sm font-bold mb-2"
                htmlFor="title"
              >
                Payment Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
                placeholder="e.g., Hostel Fee 2023-24"
                required
              />
            </div>

            <div className="mb-5">
              <label
                className="block text-gray-300 text-sm font-bold mb-2"
                htmlFor="amount"
              >
                Amount (₹)*
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
                placeholder="e.g., 15000"
                min="0"
                required
              />
            </div>

            <div className="mb-5">
              <label
                className="block text-gray-300 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
                placeholder="Payment details and instructions"
                rows="3"
              />
            </div>

            <div className="mb-5">
              <label
                className="block text-gray-300 text-sm font-bold mb-2"
                htmlFor="dueDate"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-400 focus:ring-blue-500"
                />
                Enable payment immediately
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/admin/payments")}
                className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Payment"
                    : "Create Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPayment;
