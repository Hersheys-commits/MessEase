import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminHome from "./pages/AdminHome";
import CollegeVerifyPage from "./pages/CollegeVerifyPage";
import CreateCollegePage from "./pages/CreateCollegePage";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";

function App() {
    return (
        <div>
            <Routes>
                <Route
                  path="/"
                  element={<HomePage/>}
                />
                <Route
                  path="/admin/signup"
                  element={<AdminSignup/>}
                />
                <Route
                  path="/admin/login"
                  element={<AdminLogin/>}
                />
                <Route
                  path="/admin/home"
                  element={<AdminHome/>}
                />
                <Route
                  path="/college/verify/:code"
                  element={<CollegeVerifyPage />}
                />
                <Route
                  path="/admin/college/create"
                  element={<CreateCollegePage/>}
                />
                <Route
                  path="/student/login"
                  element={<StudentLogin/>}
                />
                <Route
                  path="/student/signup"
                  element={<StudentSignup/>}
                />
                <Route
                  path="*"
                  element={<PageNotFound/>}
                />
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;
