// src/App.js (Routes)
import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import CollegeVerifyPage from "./pages/CollegeVerifyPage";
import CreateCollegePage from "./pages/admin/CreateCollegePage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./components/ProtectedRoute";
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

function App() {
  return (
    <>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/signup" element={<Signup userType="admin" />} />
        <Route path="/admin/login" element={<Login userType="admin" />} />
        <Route path="/student/signup" element={<Signup userType="student" />} />
        <Route path="/student/login" element={<Login userType="student" />} />
        <Route path="/college/verify/:code" element={<CollegeVerifyPage />} />
        <Route path="/admin/college/create" element={<CreateCollegePage />} />
        <Route path="/admin/create-hostel" element={<HostelForm />} />
        <Route path="/admin/hostel/:code" element={<HostelDetailPage />} />
        <Route path="/admin/mess/create" element={<MessForm />} />
        <Route path="/admin/mess/:code" element={<MessDetails />} />
        <Route path="/student/update-profile" element={<UpdateProfile />} />

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
      <Toaster />
    </>
  );
}

export default App;
