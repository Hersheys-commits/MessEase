import React, { useState, useEffect } from "react";
import AuthForm from "../../components/auth/AuthForm";
import OTPVerification from "../../components/auth/OTPVerification";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Squares from "../../components/ui/Squares";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

const Signup = ({ userType = "student" }) => {
  const [otpSent, setOtpSent] = useState(false);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.post("/api/student/verify-token");
        console.log(res);
      } catch (error) {
        console.log(error);
        dispatch(logout());
        console.log("user after logout: ", user);
      }
    };
    checkUser();
  }, [ userType, navigate]);

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

  // Base styles for both user types
  const basePageStyle =
    "min-h-screen flex items-center justify-center p-4 relative";

  // Additional gradient only for admin users
  const pageStyle =
    userType === "admin"
      ? `${basePageStyle} bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900`
      : basePageStyle;

  const redirectPath = userType === "admin" ? "/admin/home" : "/student/home";

  const spotlightColor =
    userType === "admin"
      ? "rgba(59, 130, 246, 0.3)" // More blue for admin
      : "rgba(125, 211, 252, 0.2)"; // Lighter blue for student

  return (
    <div className={pageStyle}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Squares
          speed={0.2}
          squareSize={40}
          direction="diagonal"
          borderColor="#374151" // gray-700
          hoverFillColor="#4B5563" // gray-600
        />
      </div>

      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <SpotlightCard
          className="w-full max-w-sm"
          spotlightColor={spotlightColor}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
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
                containerless={true}
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
        </SpotlightCard>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Signup;
