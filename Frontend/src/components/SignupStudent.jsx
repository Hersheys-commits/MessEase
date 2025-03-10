// src/components/SignupStudent.js
import React, { useState } from "react";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";

export default function SignupStudent({ onOTPSent }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match.");
    }
    try {
      await api.post("/api/student/signup", formData);
      toast.success("OTP sent to your email.");
      // Pass email, name, and password to OTP component
      onOTPSent({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Student Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Name"
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Signup
        </button>
      </form>
    </div>
  );
}
