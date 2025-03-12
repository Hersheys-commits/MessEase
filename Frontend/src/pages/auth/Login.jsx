// src/pages/auth/Login.js
import React from "react";
import AuthForm from "../../components/auth/AuthForm";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const Login = ({ userType = 'student' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginFields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      validation: { 
        required: 'Email is required'
      }
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      validation: {
        required: 'Password is required'
      }
    }
  ];

  const handleLoginSubmit = async (data) => {
    try {
      const endpoint = userType === 'admin' ? '/api/admin/login' : '/api/student/login';
      
      const response = await api.post(endpoint, data);
      
      // Store tokens
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Update Redux state
      dispatch(setUser(response.data));
      
      toast.success(`${userType === 'admin' ? 'Admin' : 'Student'} login successful!`);
      
      // Redirect based on user type
      const redirectPath = userType === 'admin' ? '/admin/home' : '/student/home';
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  const pageStyle = userType === 'admin'
    ? "min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-100 to-blue-200 p-6"
    : "min-h-screen flex items-center justify-center bg-gray-100 p-4";

  return (
    <div className={pageStyle}>
      <Toaster />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthForm
          fields={loginFields}
          onSubmit={handleLoginSubmit}
          submitText={`Login as ${userType === 'admin' ? 'Admin' : 'Student'}`}
          title={`${userType === 'admin' ? 'Admin' : 'Student'} Login`}
          GoogleAuthComponent={<GoogleAuthButton 
            userType={userType} 
            buttonText={`Sign in with Google`}
          />}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;