// src/App.js (Routes)
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import CollegeVerifyPage from "./pages/CollegeVerifyPage";
import CreateCollegePage from "./pages/admin/CreateCollegePage";
import PageNotFound from "./pages/PageNotFound";
import { CustomToaster } from "./utils/toast";
import { Toaster } from "react-hot-toast";
// Import your actual components here
import StudentHome from "./pages/student/StudentHome";
import HomePage from "./pages/HomePage";
import AdminHome from "./pages/admin/AdminHome";
import HostelForm from "./pages/admin/HostelForm";
import AvailableRooms from "./pages/student/AvailableRooms";
import BookRooms from "./pages/student/BookRooms";
import HostelDetailPage from "./pages/admin/HostelDetailPage";
import MessForm from "./pages/admin/MessForm";
import MessDetails from "./pages/admin/MessDetails";
import VotingPage from "./pages/student/VotingPage";
import ElectionResultsPage from "./pages/student/ElectionResultsPage";
import ApplicationForm from "./pages/student/ApplicationForm";
import AdminApplicationReview from "./pages/admin/AdminApplicationReview";
import AdminElectionConfig from "./pages/admin/AdminElectionConfig";
import AdminElectionResults from "./pages/admin/AdminElectionResults";
import BookedRooms from "./pages/student/BookedRooms";
import StudentElectionsPage from "./pages/student/StudentElectionsPage";
import UpdateProfile from "./pages/student/UpdateProfilePage";
import ProfilePage from "./pages/student/ProfilePage";
import AdminProfile from "./pages/admin/profile/AdminProfile";
import UpdateAdminProfile from "./pages/admin/profile/UpdateAdminProfile";
import UpdateCollege from "./pages/admin/profile/UpdateCollege";
import PaymentManagement from "./pages/admin/fees/PaymentManagement";
import CreateEditPayment from "./pages/admin/fees/CreateEditPayment";
import PaidUsersList from "./pages/admin/fees/PaidUsersList";
import FeesPaymentPage from "./pages/student/FeesPaymentPage";
import StudentProfilePage from "./pages/admin/StudentProfilePage";
import StudentListPage from "./pages/admin/StudentListPage";
import MessDetailsStudent from "./pages/student/MessDetailsStudent";
import MessTimeTable from "./pages/student/MessTimeTable";
import JoinCollegePage from "./pages/admin/JoinCollegePage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import MessComplaints from "./pages/student/MessComplaints.jsx";
import HostelComplaintsPage from "./pages/admin/HostelComplaints.jsx";
import MessComplaintsPage from "./pages/admin/MessComplaints.jsx";

function App() {
  useEffect(() => {
    const loadRazorpayScript = async () => {
      const res = await loadRazorpay();
      if (!res) {
        console.error("Razorpay SDK failed to load");
      }
    };

    loadRazorpayScript();
  }, []);

  return (
    <>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/signup" element={<Signup userType="admin" />} />
        <Route path="/admin/login" element={<Login userType="admin" />} />
        <Route path="/student/signup" element={<Signup userType="student" />} />
        <Route path="/student/login" element={<Login userType="student" />} />
        <Route
          path="/admin/forgot-password"
          element={<ForgotPassword userType="admin" />}
        />
        <Route
          path="/student/forgot-password"
          element={<ForgotPassword userType="student" />}
        />
        <Route path="/college/verify/:code" element={<CollegeVerifyPage />} />
        <Route path="/admin/college/create" element={<CreateCollegePage />} />
        <Route path="/admin/create-hostel" element={<HostelForm />} />
        <Route path="/admin/hostel/:code" element={<HostelDetailPage />} />
        <Route
          path="/admin/hostel/complaints/:code"
          element={<HostelComplaintsPage />}
        />
        <Route path="/admin/mess/create" element={<MessForm />} />
        <Route path="/admin/mess/:code" element={<MessDetails />} />
        <Route
          path="/admin/mess/complaints/:code"
          element={<MessComplaintsPage />}
        />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/update-profile" element={<UpdateAdminProfile />} />
        <Route path="/admin/update-college" element={<UpdateCollege />} />
        <Route path="/admin/students" element={<StudentListPage />} />
        <Route path="/admin/students/:id" element={<StudentProfilePage />} />
        <Route path="/student/update-profile" element={<UpdateProfile />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route
          path="/student/mess/:messCode"
          element={<MessDetailsStudent />}
        />
        <Route
          path="/student/mess/:messCode/complaints"
          element={<MessComplaints />}
        />
        <Route
          path="/student/mess/:messCode/time-table"
          element={<MessTimeTable />}
        />
        // Admin routes
        <Route path="/admin/payments" element={<PaymentManagement />} />
        <Route
          path="/admin/payment/create/:hostelId"
          element={<CreateEditPayment />}
        />
        <Route
          path="/admin/payment/edit/:paymentId/:hostelId"
          element={<CreateEditPayment />}
        />
        <Route
          path="/admin/payment/paid-users/:paymentId"
          element={<PaidUsersList />}
        />
        // Student routes
        <Route path="/student/fees" element={<FeesPaymentPage />} />
        {/* Election Routes */}
        <Route path="/student/election" element={<StudentElectionsPage />} />
        <Route
          path="/student/election/:electionId/voting"
          element={<VotingPage />}
        />
        <Route
          path="/student/election/:electionId/results"
          element={<ElectionResultsPage />}
        />
        <Route
          path="/student/election/:electionId/form"
          element={<ApplicationForm />}
        />
        <Route
          path="/admin/election/:electionId/applications"
          element={<AdminApplicationReview />}
        />
        <Route path="/admin/election" element={<AdminElectionConfig />} />
        <Route
          path="/admin/election/:electionId/results"
          element={<AdminElectionResults />}
        />
        <Route path="/admin/college/join" element={<JoinCollegePage />} />
        <Route path="*" element={<PageNotFound />} />
        {/* Protected Routes */}
        <Route
          path="/admin/home"
          element={
            // <ProtectedRoute userType="admin">
            <AdminHome />
            // {/* </ProtectedRoute> */}
          }
        />
        <Route
          path="/student/home"
          element={
            // <ProtectedRoute userType="student">
            <StudentHome />
            // </ProtectedRoute>
          }
        />
        <Route path="/available-rooms" element={<AvailableRooms />}>
          {" "}
        </Route>
        <Route path="/book-rooms" element={<BookRooms />} />
        <Route path="/see-booking" element={<BookedRooms />} />
      </Routes>
      {/* <Toaster
        position="top-right"
      /> */}
      <CustomToaster />
    </>
  );
}

export default App;
