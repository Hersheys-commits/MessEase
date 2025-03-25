import React, { useState } from "react";
import AuthForm from "../../components/auth/AuthForm";
import OTPVerification from "../../components/auth/OTPVerification";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Signup = ({ userType = "student" }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [userData, setUserData] = useState(null);

  const getFormFields = () => {
    const commonFields = [
      {
        id: "email",
        label: "Email",
        type: "email",
        validation: { required: "Email is required" },
      },
      {
        id: "name",
        label: "Full Name",
        type: "text",
        validation: { required: "Name is required" },
      },
      {
        id: "password",
        label: "Password",
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
        label: "Confirm Password",
        type: "password",
        validation: {
          required: "Please confirm your password",
          validate: (value) =>
            value === getFormValues("password") || "Passwords do not match",
        },
      },
    ];

    if (userType === "admin") {
      commonFields.push({
        id: "phoneNumber",
        label: "Phone Number",
        type: "text",
        validation: { required: "Phone number is required" },
      });
    }
    return commonFields;
  };

  const getFormValues = (field) => {
    return document.getElementById(field)?.value;
  };

  const handleOTPSent = (data) => {
    setUserData(data);
    setOtpSent(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      const endpoint =
        userType === "admin" ? "/api/admin/register" : "/api/student/signup";

      await api.post(endpoint, data);
      toast.success("OTP sent to your email.");
      handleOTPSent(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Error registering ${userType}`
      );
    }
  };

  const pageStyle =
    userType === "admin"
      ? "min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 p-6"
      : "min-h-screen flex items-center justify-center bg-gray-900 p-4";

  const redirectPath = userType === "admin" ? "/admin/home" : "/student/home";

  return (
    <div className={pageStyle}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">
            {userType === "admin" ? "Admin" : "Student"} Registration
          </h2>
          {otpSent ? (
            <OTPVerification
              email={userData.email}
              name={userData.name}
              password={userData.password}
              phoneNumber={userData.phoneNumber}
              userType={userType}
              redirectPath={redirectPath}
              darkMode={true}
            />
          ) : (
            <>
              <AuthForm
                fields={getFormFields()}
                onSubmit={handleFormSubmit}
                submitText={`Register as ${userType === "admin" ? "Admin" : "Student"}`}
                title=""
                darkMode={true}
              />
              <div className="mt-4 text-center text-sm text-gray-400">
                {userType === "admin" ? (
                  <Link to="/admin/login" className="hover:text-blue-400">
                    Already have an account? Login
                  </Link>
                ) : (
                  <Link to="/student/login" className="hover:text-blue-400">
                    Already have an account? Login
                  </Link>
                )}
              </div>
              <div className="mt-6">
                <GoogleAuthButton
                  userType={userType}
                  buttonText={`Sign up with Google`}
                  darkMode={true}
                />
              </div>
            </>
          )}
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Signup;
