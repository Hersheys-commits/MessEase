// src/components/auth/GoogleAuthButton.js
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "../../hooks/useGoogleAuth";

const GoogleAuthButton = ({ userType, buttonText }) => {
  const { handleGoogleSuccess, handleGoogleFailure } = useGoogleAuth(userType);

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google logo"
              className="w-5 h-5"
            />
            <span className="text-gray-700 font-medium">
              {buttonText || `Sign in with Google`}
            </span>
          </button>
        )}
      />
    </div>
  );
};

export default GoogleAuthButton;
