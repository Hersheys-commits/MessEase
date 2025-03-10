// src/components/CollegeVerifyPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosRequest";
import toast, { Toaster } from "react-hot-toast";

const CollegeVerifyPage = () => {
  const { code } = useParams();
  const [college, setCollege] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await api.get(`/api/college/verification/${code}`);
        setCollege(response.data);
      } catch (error) {
        toast.error("Error fetching college details");
      }
    };

    fetchCollege();
  }, [code]);

  const handleDecision = async (decision) => {
    try {
      const response = await api.post(`/api/college/verification/${code}`, {
        decision,
      });
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error processing your decision"
      );
    }
  };

  if (!college) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Toaster />
      <div className="max-w-xl w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">College Verification</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {college.name}
          </p>
          <p>
            <strong>Domain:</strong> {college.domain}
          </p>
          <p>
            <strong>Website:</strong> {college.website}
          </p>
          <p>
            <strong>Contact Email:</strong> {college.contactEmail}
          </p>
          <p>
            <strong>Contact Phone:</strong> {college.contactPhone}
          </p>
          <p>
            <strong>Address:</strong> {college.address.street},{" "}
            {college.address.city}, {college.address.state},{" "}
            {college.address.pincode}, {college.address.country}
          </p>
        </div>
        <div className="mt-6 flex justify-around">
          <button
            onClick={() => handleDecision("verify")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Verify
          </button>
          <button
            onClick={() => handleDecision("reject")}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeVerifyPage;
