// src/components/auth/OTPVerification.js
import React, { useState } from "react";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const OTPVerification = ({
  email,
  name,
  password,
  phoneNumber,
  userType,
  redirectPath,
}) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = `/api/${userType}/verify-otp`;
      const payload = { email, otp, name, password };

      // Add phoneNumber to payload for admin users
      if (userType === "admin" && phoneNumber) {
        payload.phoneNumber = phoneNumber;
      }

      const response = await api.post(endpoint, payload);

      // Handle tokens for admin users
      if (userType === "admin") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        dispatch(setUser(response.data));
      }

      toast.success(
        `${userType === "admin" ? "Admin" : "Student"} registration successful!`
      );
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {userType === "admin" ? "Admin" : "Student"} OTP Verification
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Please enter the verification code sent to {email}
      </p>
      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;
