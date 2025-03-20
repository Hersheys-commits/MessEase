import React from "react";
import { useForm } from "react-hook-form";

const AuthForm = ({
  fields,
  onSubmit,
  submitText,
  title,
  showGoogleAuth = true,
  GoogleAuthComponent = null,
  darkMode = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  // Define base classes for dark mode vs. light mode with smaller inputs
  const containerClass = darkMode
    ? "w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
    : "w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200";

  const titleClass = darkMode
    ? "text-2xl font-semibold text-center text-white mb-4"
    : "text-2xl font-semibold text-center text-gray-800 mb-6";

  const labelClass = darkMode
    ? "text-base font-medium text-gray-300"
    : "text-base font-medium text-gray-700";

  const inputClass = darkMode
    ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
    : "w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base";

  const errorClass = "text-red-500 text-sm mt-1";

  const buttonClass = darkMode
    ? "w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 transition duration-200"
    : "w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200";

  return (
    <div className={containerClass}>
      {title && <h2 className={titleClass}>{title}</h2>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <label htmlFor={field.id} className={labelClass}>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              {...register(field.id, field.validation)}
              className={inputClass}
            />
            {errors[field.id] && (
              <p className={errorClass}>{errors[field.id].message}</p>
            )}
          </div>
        ))}

        <button type="submit" className={buttonClass}>
          {submitText}
        </button>

        {showGoogleAuth && GoogleAuthComponent && (
          <div className="mt-4 text-center">
            <p
              className={darkMode ? "text-gray-400 mb-2" : "text-gray-600 mb-2"}
            >
              Or sign in with
            </p>
            {GoogleAuthComponent}
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
