
import React, { useState } from 'react';
import api from '../utils/axiosRequest'; // Import your custom axios instance

const JoinCollegePage = () => {
  // State to store college details
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);

  const handleCodeChange = (e) => {
    setCollegeCode(e.target.value);
    // Clear previous search results when typing
    if (collegeDetails) {
      setCollegeDetails(null);
      setShowRoleOptions(false);
      setSelectedRole('');
      setApplicationStatus('');
    }
    if (error) {
      setError('');
    }
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(e.target.value));
  };

  // Function to fetch college details using the axios instance
  const searchCollege = async () => {
    // Validate input
    if (!collegeCode.trim()) {
      setError('Please enter a college code');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationStatus('');

    try {
      // Using your existing getCollegeByCode endpoint from the controller
      const response = await api.get(`/api/college/verification/${collegeCode}`);
      
      // If we reach here, the request was successful
      const data = response.data;
      
      if (data) {
        setCollegeDetails(data);
        // Only show role options if college is verified
        if (data.status === 'verified') {
          setShowRoleOptions(true);
        }
      } else {
        setError('No college found with that code');
      }
    } catch (err) {
      console.error('Error fetching college data:', err);
      
      // Provide specific error messages based on error type
      if (err.response) {
        // The college controller returns 404 when college is not found
        if (err.response.status === 404) {
          setError('College not found. Please check the code and try again.');
        } else {
          setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your connection.');
      } else {
        // Something else caused the error
        setError('An error occurred while searching for the college.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle role selection and application
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // Function to submit application for selected role with email notification
  const submitRoleApplication = async () => {
    if (!collegeDetails || !selectedRole) return;
    
    // Validate email before submission
    if (!userEmail.trim() || !emailValid) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setApplicationStatus('');
    setError('');
    
    try {
      // Updated endpoint to include email notification
      await api.post('/api/college/apply-role', { 
        role: selectedRole,
        email: userEmail,
        collegeName: collegeDetails.name,
        // Include additional user info that you might want to send in the email
        applicationDetails: {
          position: roles.find(r => r.id === selectedRole)?.label,
          collegeCode: collegeCode,
          appliedAt: new Date().toISOString()
        }
      });
      
      setApplicationStatus('success');
      setShowRoleOptions(false);
    } catch (err) {
      console.error('Error applying for role:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Application failed: ${err.response.data.message}`);
      } else {
        setError('Failed to submit application. Please try again.');
      }
      
      setApplicationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  // Available roles
  const roles = [
    { id: 'messManager', label: 'Mess Manager' },
    { id: 'admin', label: 'Admin' },
    { id: 'accountant', label: 'Accountant' }
  ];

  return (
    <div className='text-center mt-[-20px] pt-10 bg-slate-200 w-screen min-h-screen pb-1'>
      <div className='bg-white w-1/3 m-auto p-4 rounded-lg mb-6'>
        <h1 className='text-3xl text-center mt-4 mb-4'>Join College</h1>
        
        <div className='flex flex-col mt-10'>
          <label className='text-left pl-5 text-lg'>Enter College Code</label>
          <div className='flex px-5'>
            <input 
              type="text"
              placeholder="College Code"
              className='border border-gray-300 p-4 mt-2 rounded flex-grow'
              value={collegeCode}
              onChange={handleCodeChange}
              onKeyDown={(e) => e.key === 'Enter' && searchCollege()}
            />
            <button 
              onClick={searchCollege}
              className='bg-blue-600 text-white px-4 mt-2 ml-2 rounded hover:bg-blue-700'
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <p className='text-red-500 text-left pl-5 mt-2'>{error}</p>
          )}
        </div>
        
        {collegeDetails && (
          <div className='text-left pl-5 ml-5 mr-5 text-xl flex flex-col mt-4'>
            <h2 className='text-gray-800'>College Name:</h2>
            <p className='border border-gray-200 pl-3 p-2 mt-1 mb-3 ml-0 rounded bg-gray-50'>
              {collegeDetails.name}
            </p>
            
            {collegeDetails.status && (
              <>
                <h2 className='text-gray-800'>Status:</h2>
                <p className={`border border-gray-200 pl-3 p-2 mt-1 mb-3 ml-0 rounded ${
                  collegeDetails.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {collegeDetails.status.charAt(0).toUpperCase() + collegeDetails.status.slice(1)}
                </p>
              </>
            )}
            
            {collegeDetails.website && (
              <>
                <h2 className='text-gray-800'>Website:</h2>
                <p className='border border-gray-200 pl-3 p-2 mt-1 mb-3 ml-0 rounded bg-gray-50'>
                  {collegeDetails.website}
                </p>
              </>
            )}
            
            {collegeDetails.address && (
              <>
                <h2 className='text-gray-800'>Location:</h2>
                <p className='border border-gray-200 pl-3 p-2 mt-1 mb-3 ml-0 rounded bg-gray-50'>
                  {`${collegeDetails.address.city}, ${collegeDetails.address.state}`}
                </p>
              </>
            )}
            
            {collegeDetails.status !== 'verified' && (
              <p className='text-amber-600 text-center text-sm mt-2'>
                This college is pending verification and cannot be joined yet.
              </p>
            )}
            
            {showRoleOptions && (
              <div className='mt-4'>
                <h2 className='text-gray-800 mb-2'>Select Position:</h2>
                <div className='flex flex-col space-y-3'>
                  {roles.map(role => (
                    <div 
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedRole === role.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className='flex items-center'>
                        <div className={`w-4 h-4 rounded-full border ${
                          selectedRole === role.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        }`}>
                          {selectedRole === role.id && (
                            <div className='w-2 h-2 bg-white rounded-full m-auto mt-1'></div>
                          )}
                        </div>
                        <span className='ml-2'>{role.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className='mt-4'>
                  <label className='text-gray-800'>Your Email Address:</label>
                  <input 
                    type="email"
                    placeholder="Enter your email"
                    className={`border p-3 mt-2 rounded w-full ${!emailValid && userEmail ? 'border-red-500' : 'border-gray-300'}`}
                    value={userEmail}
                    onChange={handleEmailChange}
                  />
                  {!emailValid && userEmail && (
                    <p className='text-red-500 text-sm mt-1'>Please enter a valid email address</p>
                  )}
                  <p className='text-sm text-gray-600 mt-1'>
                    You will receive confirmation and updates about your application at this email.
                  </p>
                </div>
                
                <button 
                  onClick={submitRoleApplication}
                  disabled={!selectedRole || loading || !userEmail || !emailValid}
                  className={`w-full py-3 mt-5 rounded font-medium ${
                    !selectedRole || loading || !userEmail || !emailValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Apply for Selected Position'}
                </button>
                
                <p className='text-sm text-gray-600 mt-2 text-center'>
                  Your application will be sent to the college administrator for review.
                </p>
              </div>
            )}
            
            {applicationStatus === 'success' && (
              <div className='mt-4 p-4 bg-green-50 text-green-700 rounded border border-green-200'>
                <p className='text-center'>
                  <strong>Application Submitted Successfully!</strong>
                </p>
                <p className='text-center text-sm mt-1'>
                  Your application for the position of {roles.find(r => r.id === selectedRole)?.label} 
                  has been sent to the college administrator. 
                </p>
                <p className='text-center text-sm mt-2'>
                  <strong>A confirmation email has been sent to {userEmail}.</strong> You will receive 
                  updates about your application status via email.
                </p>
              </div>
            )}
            
            {applicationStatus === 'failed' && (
              <div className='mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-200'>
                <p className='text-center'>
                  <strong>Application Failed</strong>
                </p>
                <p className='text-center text-sm mt-1'>
                  There was an error submitting your application. Please try again later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCollegePage;