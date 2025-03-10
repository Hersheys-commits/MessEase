// src/components/StudentSignup.js
import React, { useState } from "react";
import StudentSignupForm from "../components/SignupStudent";
import OTPVerification from "../components/OTPVerification";
import { Toaster } from "react-hot-toast";

export default function StudentSignup() {
  const [otpSent, setOtpSent] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleOTPSent = (data) => {
    setUserData(data);
    setOtpSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster />
      {otpSent ? (
        <OTPVerification
          email={userData.email}
          name={userData.name}
          password={userData.password}
        />
      ) : (
        <StudentSignupForm onOTPSent={handleOTPSent} />
      )}
    </div>
  );
}
