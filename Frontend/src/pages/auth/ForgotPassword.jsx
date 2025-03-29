import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import AuthForm from "../../components/auth/AuthForm";

const ForgotPassword = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email entry, 2: Password reset with OTP
  const [email, setEmail] = useState("");

  // Form field configurations
  const emailFields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      validation: {
        required: "Email is required",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
  ];

  const resetFields = [
    {
      id: "otp",
      label: "OTP",
      type: "text",
      validation: {
        required: "OTP is required",
        minLength: {
          value: 6,
          message: "OTP must be 6 digits",
        },
      },
    },
    {
      id: "password",
      label: "New Password",
      type: "password",
      validation: {
        required: "Password is required",
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
      },
    },
    {
      id: "confirmPassword",
      label: "Confirm New Password",
      type: "password",
      validation: {
        required: "Please confirm your password",
        validate: (value) =>
          value === document.getElementById("password")?.value ||
          "Passwords do not match",
      },
    },
  ];

  // Handle email submission
  const handleEmailSubmit = async (data) => {
    try {
      setEmail(data.email);
      const endpoint =
        userType === "admin"
          ? "/api/admin/forgot-password"
          : "/api/student/forgot-password";

      await api.post(endpoint, { email: data.email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Handle password reset with OTP verification
  const handleResetSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const endpoint =
        userType === "admin"
          ? "/api/admin/change-password"
          : "/api/student/change-password";

      await api.post(endpoint, {
        email: email,
        otp: data.otp,
        password: data.password,
      });

      toast.success("Password changed successfully");
      navigate(`/${userType}/login`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const pageStyle =
    userType === "admin"
      ? "min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 p-6"
      : "min-h-screen flex items-center justify-center bg-gray-900 p-4";

  return (
    <div className={pageStyle}>
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">
          {userType === "admin" ? "Admin" : "Student"} Password Reset
        </h2>

        {step === 1 && (
          <AuthForm
            fields={emailFields}
            onSubmit={handleEmailSubmit}
            submitText="Send OTP"
            title=""
            darkMode={true}
          />
        )}

        {step === 2 && (
          <>
            <p className="text-gray-300 mb-4 text-sm">
              We've sent a 6-digit OTP to {email}
            </p>
            <AuthForm
              fields={resetFields}
              onSubmit={handleResetSubmit}
              submitText="Reset Password"
              title=""
              darkMode={true}
            />
            <button
              onClick={() => handleEmailSubmit({ email })}
              className="mt-2 w-full text-sm text-blue-400 hover:text-blue-300"
            >
              Resend OTP
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to={`/${userType}/login`}
            className="text-sm text-gray-400 hover:text-blue-400"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
