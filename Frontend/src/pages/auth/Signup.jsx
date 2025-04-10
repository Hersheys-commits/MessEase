import React, { useState, useEffect } from "react";
import AuthForm from "../../components/auth/AuthForm";
import OTPVerification from "../../components/auth/OTPVerification";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Squares from "../../components/ui/Squares";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import useGoogleAuth from "../../hooks/useGoogleAuth";

const Signup = ({ userType = "student" }) => {
  const [otpSent, setOtpSent] = useState(false);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { handleGoogleSuccess, handleGoogleFailure } = useGoogleAuth(userType);

  useEffect(() => {
    const checkUser = async () => {
      // Check if the user is authenticated first
      if (!isAuthenticated) {
        dispatch(logout());
        setLoading(false);
        return;
      }

      try {
        const res = await api.post(`/api/${userType}/verify-token`);
        console.log(res);
        navigate(`/${userType}/home`);
      } catch (error) {
        console.log(error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [isAuthenticated, navigate, dispatch]);

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

      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        onScriptLoadError={() => console.log("Script load error")}
        onScriptLoadSuccess={() => console.log("Script loaded successfully")}
      >
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-200 bg-gray-800"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                        alt="Google logo"
                        className="w-5 h-5"
                      />
                      <span className="text-white font-medium">
                        {`Sign in with Google`}
                      </span>
                    </button>
                  )}
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

// import React, { useState, useEffect } from "react";
// import AuthForm from "../../components/auth/AuthForm";
// import OTPVerification from "../../components/auth/OTPVerification";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import api from "../../utils/axiosRequest";
// import toast from "react-hot-toast";
// import { Link, useNavigate } from "react-router-dom";
// import Squares from "../../components/ui/Squares";
// import SpotlightCard from "../../components/ui/SpotlightCard";
// import {jwtDecode} from "jwt-decode";
// import { useDispatch, useSelector } from "react-redux";
// import { logout, setUser } from "../../store/authSlice";

// const Signup = ({ userType = "student" }) => {
//   const [otpSent, setOtpSent] = useState(false);
//   const dispatch = useDispatch();
//   const [userData, setUserData] = useState(null);
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkUser = async () => {
//       // Check if the user is authenticated first
//       if (!isAuthenticated) {
//         dispatch(logout());
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await api.post(`/api/${userType}/verify-token`);
//         console.log(res);
//         navigate(`/${userType}/home`);
//       } catch (error) {
//         console.log(error);
//         dispatch(logout());
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkUser();
//   }, [isAuthenticated, navigate, dispatch]);

//   const getFormFields = () => {
//     const commonFields = [
//       {
//         id: "email",
//         label: "Email",
//         type: "email",
//         validation: { required: "Email is required" },
//       },
//       {
//         id: "name",
//         label: "Full Name",
//         type: "text",
//         validation: { required: "Name is required" },
//       },
//       {
//         id: "password",
//         label: "Password",
//         type: "password",
//         validation: {
//           required: "Password is required",
//           minLength: {
//             value: 8,
//             message: "Password must be at least 8 characters",
//           },
//         },
//       },
//       {
//         id: "confirmPassword",
//         label: "Confirm Password",
//         type: "password",
//         validation: {
//           required: "Please confirm your password",
//           validate: (value) =>
//             value === getFormValues("password") || "Passwords do not match",
//         },
//       },
//     ];

//     if (userType === "admin") {
//       commonFields.push({
//         id: "phoneNumber",
//         label: "Phone Number",
//         type: "text",
//         validation: { required: "Phone number is required" },
//       });
//     }
//     return commonFields;
//   };

//   const getFormValues = (field) => {
//     return document.getElementById(field)?.value;
//   };

//   const handleOTPSent = (data) => {
//     setUserData(data);
//     setOtpSent(true);
//   };

//   const handleFormSubmit = async (data) => {
//     try {
//       const endpoint =
//         userType === "admin" ? "/api/admin/register" : "/api/student/signup";

//       await api.post(endpoint, data);
//       toast.success("OTP sent to your email.");
//       handleOTPSent(data);
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || `Error registering ${userType}`
//       );
//     }
//   };

//   // Handle Google authentication for signup
//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       const decoded = jwtDecode(credentialResponse.credential);
//       console.log("Decoded token data:", decoded);

//       // Extract user info from the decoded token
//       const googleUserData = {
//         email: decoded.email,
//         name: decoded.name,
//         avatar: decoded.picture,
//         googleId: decoded.sub,
//         verified: decoded.email_verified
//       };

//       const endpoint = userType === "admin"
//         ? "/api/admin/google" // Using the endpoint from your working example
//         : "/api/student/google"; // Using the endpoint from your working example

//       // Call your backend with the decoded token data
//       const response = await api.post(
//         endpoint,
//         { googleUser: googleUserData },
//         { withCredentials: true }
//       );

//       if (response?.data?.data?.error === "email exists") {
//         toast.error("Email already exists. Try signing in.");
//         return;
//       }

//       // Store user data
//       localStorage.setItem("user", JSON.stringify(response.data.data));

//       // Update Redux state
//       // dispatch(
//       //   setUser({
//       //     user: response.data.data.user,
//       //     accessToken: response.data.data.accessToken,
//       //   })
//       // );

//       // Navigate based on first-time user or returning user
//       // if (response.data.data?.first === false) {
//       //   navigate("/");
//       // } else {
//       //   navigate("/questionnaire"); // For first-time users
//       // }
//       navigate(`/${userType}/home`);
//       toast.success("Google signup successful");

//     } catch (error) {
//       console.error("Google sign-up error:", error);
//       toast.error("Google signup failed. Please try again later.");
//     }
//   };

//   const handleGoogleFailure = (error) => {
//     console.error("Google Sign Up was unsuccessful. Try again later", error);
//     toast.error("Google Sign Up failed. Please try again later.");
//   };

//   // Base styles for both user types
//   const basePageStyle =
//     "min-h-screen flex items-center justify-center p-4 relative";

//   // Additional gradient only for admin users
//   const pageStyle =
//     userType === "admin"
//       ? `${basePageStyle} bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900`
//       : basePageStyle;

//   const redirectPath = userType === "admin" ? "/admin/home" : "/student/home";

//   const spotlightColor =
//     userType === "admin"
//       ? "rgba(59, 130, 246, 0.3)" // More blue for admin
//       : "rgba(125, 211, 252, 0.2)"; // Lighter blue for student

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-gray-100">
//         <div className="flex justify-center items-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={pageStyle}>
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         <Squares
//           speed={0.2}
//           squareSize={40}
//           direction="diagonal"
//           borderColor="#374151" // gray-700
//           hoverFillColor="#4B5563" // gray-600
//         />
//       </div>

//       <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//         <SpotlightCard
//           className="w-full max-w-sm"
//           spotlightColor={spotlightColor}
//         >
//           <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
//             {userType === "admin" ? "Admin" : "Student"} Registration
//           </h2>

//           {otpSent ? (
//             <OTPVerification
//               email={userData.email}
//               name={userData.name}
//               password={userData.password}
//               phoneNumber={userData.phoneNumber}
//               userType={userType}
//               redirectPath={redirectPath}
//               darkMode={true}
//             />
//           ) : (
//             <>
//               <AuthForm
//                 fields={getFormFields()}
//                 onSubmit={handleFormSubmit}
//                 submitText={`Register as ${userType === "admin" ? "Admin" : "Student"}`}
//                 title=""
//                 darkMode={true}
//                 containerless={true}
//               />

//               <div className="mt-4 text-center text-sm text-gray-400">
//                 {userType === "admin" ? (
//                   <Link to="/admin/login" className="hover:text-blue-400">
//                     Already have an account? Login
//                   </Link>
//                 ) : (
//                   <Link to="/student/login" className="hover:text-blue-400">
//                     Already have an account? Login
//                   </Link>
//                 )}
//               </div>

//               <div className="mt-6">
//                 <div className="relative flex py-4 items-center">
//                   <div className="flex-grow border-t border-gray-600 opacity-50"></div>
//                   <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">
//                     Or continue with
//                   </span>
//                   <div className="flex-grow border-t border-gray-600 opacity-50"></div>
//                 </div>
//                 <div className="flex justify-center mt-4">
//                   <GoogleLogin
//                     onSuccess={handleGoogleSuccess}
//                     onError={handleGoogleFailure}
//                     useOneTap={false}
//                     cookiePolicy={'single_host_origin'}
//                     theme="filled_blue"
//                   />
//                 </div>
//               </div>
//             </>
//           )}
//         </SpotlightCard>
//       </GoogleOAuthProvider>
//     </div>
//   );
// };

// export default Signup;
