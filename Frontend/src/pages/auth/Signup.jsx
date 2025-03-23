// src/pages/auth/Signup.js
import React, { useState } from "react";
import AuthForm from "../../components/auth/AuthForm";
import OTPVerification from "../../components/auth/OTPVerification";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";

const Signup = ({ userType = 'student' }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [userData, setUserData] = useState(null);

  // Define form fields based on user type
  const getFormFields = () => {
    const commonFields = [
      {
        id: "email",
        label: "Email",
        type: "email",
        validation: { 
          required: 'Email is required'
        }
      },
      {
        id: "name",
        label: "Full Name",
        type: "text",
        validation: { 
          required: 'Name is required'
        }
      },
      {
        id: "password",
        label: "Password",
        type: "password",
        validation: {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        }
      },
      {
        id: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        validation: {
          required: 'Please confirm your password',
          validate: value => value === getFormValues('password') || 'Passwords do not match'
        }
      }
    ];

    // Add phone number field for admin users
    if (userType === 'admin') {
      commonFields.push({
        id: "phoneNumber",
        label: "Phone Number",
        type: "text",
        validation: { 
          required: 'Phone number is required'
        }
      });
    }

    return commonFields;
  };

  // Function to get form values (used for password validation)
  const getFormValues = (field) => {
    return document.getElementById(field)?.value;
  };

  const handleOTPSent = (data) => {
    setUserData(data);
    setOtpSent(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      const endpoint = userType === 'admin' ? '/api/admin/register' : '/api/student/signup';
      
      await api.post(endpoint, data);
      toast.success("OTP sent to your email.");
      
      // Pass user data to OTP component
      handleOTPSent(data);
    } catch (error) {
      toast.error(error.response?.data?.message || `Error registering ${userType}`);
    }
  };

  const pageStyle = userType === 'admin'
    ? "min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-100 to-blue-200 p-6"
    : "min-h-screen flex items-center justify-center bg-gray-100 p-4";

  const redirectPath = userType === 'admin' ? '/admin/home' : '/student/home';

  return (
    <div className={pageStyle}>
      <Toaster />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {otpSent ? (
          <OTPVerification
            email={userData.email}
            name={userData.name}
            password={userData.password}
            phoneNumber={userData.phoneNumber}
            userType={userType}
            redirectPath={redirectPath}
          />
        ) : (
          <AuthForm
            fields={getFormFields()}
            onSubmit={handleFormSubmit}
            submitText={`Register as ${userType === 'admin' ? 'Admin' : 'Student'}`}
            title={`${userType === 'admin' ? 'Admin' : 'Student'} Registration`}
            GoogleAuthComponent={<GoogleAuthButton 
              userType={userType} 
              buttonText={`Sign up with Google`}
            />}
          />
        )}
      </GoogleOAuthProvider>
    </div>
  );
};

export default Signup;