import React from "react";
import AuthForm from "../../components/auth/AuthForm";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const Login = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      dispatch(setUser(response.data));

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

  const pageStyle =
    userType === "admin"
      ? "min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 p-6"
      : "min-h-screen flex items-center justify-center bg-gray-900 p-4";

  return (
    <div className={pageStyle}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">
            {userType === "admin" ? "Admin" : "Student"} Login
          </h2>
          <AuthForm
            fields={loginFields}
            onSubmit={handleLoginSubmit}
            submitText={`Login as ${userType === "admin" ? "Admin" : "Student"}`}
            title=""
            darkMode={true}
          />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <Link to="/forgot-password" className="hover:text-blue-400">
              Forgot Password?
            </Link>
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
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
