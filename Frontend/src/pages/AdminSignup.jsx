import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/axiosRequest';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';

const AdminSignup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/api/admin/register', data);
    //   toast.success(response.data.message || 'Registration successful!');
      // Store tokens as needed (e.g., localStorage)
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      console.log(response)
      if (response?.statusText ==="Created") {
        dispatch(setUser(response.data)); // Save user in Redux and localStorage
        toast.success('Registration successfull!');
      } else {
        toast.error(data.message || 'Registration failed');
      }
      navigate("/admin/home");
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error registering admin'
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-indigo-100 to-blue-200 p-6">
      <Toaster />
      <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Admin Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-lg font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-lg font-medium text-gray-700">Phone Number</label>
            <input
              id="phoneNumber"
              type="text"
              {...register('phoneNumber')}
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
