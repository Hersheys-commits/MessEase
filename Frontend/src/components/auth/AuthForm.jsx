// src/components/auth/AuthForm.js
import React from "react";
import { useForm } from "react-hook-form";

const AuthForm = ({
  fields,
  onSubmit,
  submitText,
  title,
  showGoogleAuth = true,
  GoogleAuthComponent = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  return (
    <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        {title}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="text-lg font-medium text-gray-700"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              {...register(field.id, field.validation)}
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.id].message}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
        >
          {submitText}
        </button>

        {showGoogleAuth && GoogleAuthComponent && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-4">Or sign in with</p>
            {GoogleAuthComponent}
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
