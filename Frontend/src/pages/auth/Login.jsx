import React, { useEffect, useState } from "react";
import AuthForm from "../../components/auth/AuthForm";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Squares from "../../components/ui/Squares";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { logout } from "../../store/authSlice";
import { setUser } from "../../store/authSlice";

const Login = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log("login state", user);
  console.log("login state", isAuthenticated);

  useEffect(() => {
    const checkUser = async () => {
      // Check if the user is authenticated first
      if (!isAuthenticated) {
        dispatch(logout());
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/api/student/verify-token");
        console.log(res);
        navigate("/student/home");
      } catch (error) {
        console.log(error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [isAuthenticated, navigate, dispatch]);

  const loginFields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      validation: { required: "Email is required" },
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      validation: { required: "Password is required" },
    },
  ];

  const handleLoginSubmit = async (data) => {
    try {
      const endpoint =
        userType === "admin" ? "/api/admin/login" : "/api/student/login";

      const response = await api.post(endpoint, data);

      // Store tokens
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Update Redux state
      // dispatch(setUser(response.data));

      toast.success(
        `${userType === "admin" ? "Admin" : "Student"} login successful!`
      );

      const redirectPath =
        userType === "admin" ? "/admin/home" : "/student/home";
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
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

  const spotlightColor =
    userType === "admin"
      ? "rgba(59, 130, 246, 0.3)" // More blue for admin
      : "rgba(125, 211, 252, 0.2)"; // Lighter blue for student

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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
            {userType === "admin" ? "Admin" : "Student"} Login
          </h2>

          <AuthForm
            fields={loginFields}
            onSubmit={handleLoginSubmit}
            submitText={`Login as ${userType === "admin" ? "Admin" : "Student"}`}
            title=""
            darkMode={true}
            containerless={true} // Important: Don't render the container
          />

          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            {userType === "admin" ? (
              <Link to="/admin/forgot-password" className="hover:text-blue-400">
                Forgot Password?
              </Link>
            ) : (
              <Link
                to="/student/forgot-password"
                className="hover:text-blue-400"
              >
                Forgot Password?
              </Link>
            )}
            {userType === "admin" ? (
              <Link to="/admin/signup" className="hover:text-blue-400">
                Don't have an account? Sign Up
              </Link>
            ) : (
              <Link to="/student/signup" className="hover:text-blue-400">
                Don't have an account? Sign Up
              </Link>
            )}
          </div>

          <div className="mt-6">
            <GoogleAuthButton
              userType={userType}
              buttonText={`Sign in with Google`}
              darkMode={true}
            />
          </div>
        </SpotlightCard>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
