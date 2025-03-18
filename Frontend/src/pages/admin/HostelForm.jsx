import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import api from "../../utils/axiosRequest";
import { useNavigate } from "react-router-dom";

const CreateHostelPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
      totalRooms: "",
      roomCapacity: "",
      guestRooms: {
        count: 0,
      },
      workers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workers",
  });

  const workOptions = [
    "roomCleaner",
    "hostelCleaner",
    "gardenCleaner",
    "electrician",
    "accountant",
    "warden",
  ];

  const onSubmit = async (data) => {
    try {
      // Generate room numbers for guest rooms like G-01, G-02, etc.
      const roomNumbers = [];
      for (let i = 1; i <= data.guestRooms.count; i++) {
        roomNumbers.push(`G-${i.toString().padStart(2, "0")}`);
      }

      // Add room numbers to the data
      data.guestRooms.roomNumbers = roomNumbers;

      const response = await api.post("/api/hostel/create-hostel", data);
      toast.success("Hostel created successfully!");
      console.log("Hostel created:", response.data);
      navigate("/admin/home");
      // You can add navigation to a different page here if needed
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create hostel");
      console.error("Error creating hostel:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create New Hostel</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Hostel Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Hostel Name</label>
            <input
              type="text"
              {...register("name", { required: "Hostel name is required" })}
              className="w-full p-2 border rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Location</label>
            <input
              type="text"
              {...register("location", { required: "Location is required" })}
              className="w-full p-2 border rounded-md"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Total Rooms</label>
            <input
              type="number"
              {...register("totalRooms", {
                required: "Total rooms is required",
                min: { value: 1, message: "Must have at least 1 room" },
              })}
              className="w-full p-2 border rounded-md"
            />
            {errors.totalRooms && (
              <p className="text-red-500 text-sm mt-1">
                {errors.totalRooms.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Room Capacity</label>
            <input
              type="number"
              {...register("roomCapacity", {
                required: "Room capacity is required",
                min: { value: 1, message: "Capacity must be at least 1" },
              })}
              className="w-full p-2 border rounded-md"
            />
            {errors.roomCapacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.roomCapacity.message}
              </p>
            )}
          </div>
        </div>

        {/* Guest Rooms */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Guest Rooms</h2>
          <div>
            <label className="block text-gray-700 mb-1">
              Number of Guest Rooms
            </label>
            <input
              type="number"
              {...register("guestRooms.count", {
                required: "Guest room count is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              className="w-full p-2 border rounded-md"
            />
            {errors.guestRooms?.count && (
              <p className="text-red-500 text-sm mt-1">
                {errors.guestRooms.count.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Room numbers will be automatically generated (e.g., G-01, G-02)
            </p>
          </div>
        </div>

        {/* Workers */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Workers</h2>
            <button
              type="button"
              onClick={() =>
                append({ name: "", mobileNumber: "", work: workOptions[0] })
              }
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Worker
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Worker #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    {...register(`workers.${index}.name`, {
                      required: "Worker name is required",
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                  {errors.workers?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workers[index].name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    {...register(`workers.${index}.mobileNumber`, {
                      required: "Mobile number is required",
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                  {errors.workers?.[index]?.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workers[index].mobileNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Work Type</label>
                  <select
                    {...register(`workers.${index}.work`, {
                      required: "Work type is required",
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {workOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() +
                          option.slice(1).replace(/([A-Z])/g, " $1")}
                      </option>
                    ))}
                  </select>
                  {errors.workers?.[index]?.work && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workers[index].work.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-gray-500 italic">
              No workers added yet. Click "Add Worker" to add workers.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
          >
            Create Hostel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostelPage;
