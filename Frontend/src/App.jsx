
// src/App.js (Routes)
import React from 'react';
import {Routes, Route } from 'react-router-dom';
import Signup from "./pages/auth/Signup";
import Login from './pages/auth/Login';
import CollegeVerifyPage from "./pages/CollegeVerifyPage";
import CreateCollegePage from "./pages/CreateCollegePage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from 'react-hot-toast';
// Import your actual components here
import StudentHome from "./pages/StudentHome";
import HomePage from './pages/HomePage';
import AdminHome from './pages/AdminHome';
import HostelForm from './pages/HostelForm';

function App() {
  return (
    <>
      <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<HomePage/>}/>
          <Route path="/admin/signup" element={<Signup userType="admin" />} />
          <Route path="/admin/login" element={<Login userType="admin" />} />
          <Route path="/student/signup" element={<Signup userType="student" />} />
          <Route path="/student/login" element={<Login userType="student" />} />
          <Route
            path="/college/verify/:code"
            element={<CollegeVerifyPage />}
          />
          <Route
            path="/admin/college/create"
            element={<CreateCollegePage/>}
          />
          <Route 
            path="/admin/create-hostel"
            element={<HostelForm/>}
          />
          <Route
            path="*"
            element={<PageNotFound/>}
          />
          
          {/* Protected Routes */}
          <Route 
            path="/admin/home" 
            element={
              <ProtectedRoute userType="admin">
                <AdminHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/home" 
            element={
              <ProtectedRoute userType="student">
                <StudentHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to student login */}
          <Route path="/" element={<Login userType="student" />} />
  
        </Routes>
        <Toaster/>
    </>
  );
}

export default App;