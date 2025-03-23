// src/components/AdminHome.js
import React,{useState,useEffect} from "react";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/axiosRequest";

const AdminHome = () => {
  const [college, setCollege] = useState(null);
  // const navigate = useNavigate();
  const [collegeExists, setCollegeExists] =useState(false);
  const [requestPending, setRequestPending] =useState(false);
  
  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await api.post(`/api/admin/college`);
        console.log(response);
        setCollege(response.data.college);
        if(response.status==200){
            setCollegeExists(true);
        }else if(response.status==207){
            setRequestPending(true);
        }
      } catch (error) {
        toast.error("Error fetching college details");
      }
    };

    fetchCollege();
  }, []);


  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Admin Home</h1>
      {collegeExists ? (
        <div>
          {/* Display college details here */}
          <h2 className="text-xl">College Details</h2>
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
<<<<<<< HEAD
            <Link to="/admin/create-hostel">
                <button className="bg-red-500 p-10 mt-5 text-white rounded">
                Add Hostel
                </button>
            </Link>
=======

            <Link to="/create-hostel">
              <button className="bg-red-500 p-10 mt-5 text-white rounded">
                Add Hostel
              </button>
          </Link>
        
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
        </div>
    ) :( requestPending?
            (
                <>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Request Pending
                    </button>
                </>
            ):
            (
              <div className="space-y-4 flex flex-col px-4 max-w-max  ">
                <Link
                to="/admin/college/create"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                Create College
                </Link>
                
                <Link
                to="/admin/college/join"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-5px"
                >
                Join College
                </Link>

               </div>

            ) 
        )}
    </div>
  );
};

export default AdminHome;
