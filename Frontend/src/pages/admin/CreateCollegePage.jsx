// src/components/CreateCollegePage.js
import React from "react";
import { useForm } from "react-hook-form";
import api from "../../utils/axiosRequest";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateCollegePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post("/api/college/create", data);
      toast.success("College request submitted. Await verification.");
      navigate("/admin/home"); // Redirect back to Admin Home
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating college request"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster />
      <div className="max-w-xl w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create College</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">College Name</label>
            <input
              type="text"
              {...register("name", { required: "College name is required" })}
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Domain</label>
            <input
              type="text"
              {...register("domain", { required: "Domain is required" })}
              placeholder="e.g., mnnit.ac.in"
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.domain && (
              <p className="text-red-500 text-sm">{errors.domain.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Admin Post</label>
            <input
              type="text"
              {...register("adminPost", {
                required: "Your post in college is required",
              })}
              placeholder="e.g., Registrar, Dean"
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.adminPost && (
              <p className="text-red-500 text-sm">{errors.adminPost.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Website</label>
            <input
              type="text"
              {...register("website")}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Contact Email</label>
            <input
              type="email"
              {...register("contactEmail", {
                required: "Contact email is required",
              })}
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Contact Phone</label>
            <input
              type="text"
              {...register("contactPhone", {
                required: "Contact phone is required",
              })}
              className="w-full border border-gray-300 p-2 rounded"
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mt-4">College Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                {...register("address.street", {
                  required: "Street is required",
                })}
                placeholder="Street"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                {...register("address.city", { required: "City is required" })}
                placeholder="City"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                {...register("address.state", {
                  required: "State is required",
                })}
                placeholder="State"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                {...register("address.pincode", {
                  required: "Pincode is required",
                })}
                placeholder="Pincode"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                {...register("address.country", {
                  required: "Country is required",
                })}
                placeholder="Country"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCollegePage;
