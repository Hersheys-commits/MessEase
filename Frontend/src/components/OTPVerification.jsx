// src/components/OTPVerification.js
import React, { useState } from "react";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";

export default function OTPVerification({ email, name, password }) {
  const [otp, setOtp] = useState("");

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/student/verify-otp", { email, otp, name, password });
      toast.success("Signup successful.");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">OTP Verification</h2>
      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Enter OTP</label>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
