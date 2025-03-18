import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../utils/axiosRequest.js";

const MessDetails = () => {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messData, setMessData] = useState(null);
  const [weeklyFoodData, setWeeklyFoodData] = useState(null);
  const [editingMess, setEditingMess] = useState(false);
  const [editingFood, setEditingFood] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    register: registerFood,
    handleSubmit: handleSubmitFood,
    setValue: setValueFood,
    formState: { errors: errorsFood },
  } = useForm();

  // Fetch mess details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mess/${code}`);
        setMessData(response.data.data.mess);
        setWeeklyFoodData(response.data.data.weeklyFood);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch mess details");
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  // Set form values when editing mess
  useEffect(() => {
    if (editingMess && messData) {
      setValue("name", messData.name);
      setValue("location", messData.location);
      setValue("capacity", messData.capacity);
      setValue("notice", messData.notice);
      if (messData.workers && messData.workers.length > 0) {
        messData.workers.forEach((worker, index) => {
          setValue(`workers[${index}].name`, worker.name);
          setValue(`workers[${index}].mobileNumber`, worker.mobileNumber);
        });
      }
    }
  }, [editingMess, messData, setValue]);

  // Set form values when editing food
  useEffect(() => {
    if (editingFood && weeklyFoodData) {
      weeklyFoodData.meals.forEach((meal, index) => {
        setValueFood(`meals[${index}].day`, meal.day);

        // Breakfast
        setValueFood(`meals[${index}].breakfast.items`, meal.breakfast.items);
        setValueFood(
          `meals[${index}].breakfast.timing.hour`,
          meal.breakfast.timing.hour
        );
        setValueFood(
          `meals[${index}].breakfast.timing.minute`,
          meal.breakfast.timing.minute
        );
        setValueFood(
          `meals[${index}].breakfast.timing.am_pm`,
          meal.breakfast.timing.am_pm
        );

        // Lunch
        setValueFood(`meals[${index}].lunch.items`, meal.lunch.items);
        setValueFood(
          `meals[${index}].lunch.timing.hour`,
          meal.lunch.timing.hour
        );
        setValueFood(
          `meals[${index}].lunch.timing.minute`,
          meal.lunch.timing.minute
        );
        setValueFood(
          `meals[${index}].lunch.timing.am_pm`,
          meal.lunch.timing.am_pm
        );

        // Evening Snacks
        setValueFood(
          `meals[${index}].eveningSnacks.items`,
          meal.eveningSnacks.items
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.hour`,
          meal.eveningSnacks.timing.hour
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.minute`,
          meal.eveningSnacks.timing.minute
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.am_pm`,
          meal.eveningSnacks.timing.am_pm
        );

        // Dinner
        setValueFood(`meals[${index}].dinner.items`, meal.dinner.items);
        setValueFood(
          `meals[${index}].dinner.timing.hour`,
          meal.dinner.timing.hour
        );
        setValueFood(
          `meals[${index}].dinner.timing.minute`,
          meal.dinner.timing.minute
        );
        setValueFood(
          `meals[${index}].dinner.timing.am_pm`,
          meal.dinner.timing.am_pm
        );
      });
    }
  }, [editingFood, weeklyFoodData, setValueFood]);

  // Submit handler for mess details
  const onSubmitMess = async (data) => {
    try {
      const response = await api.put(`/api/mess/${code}`, data);
      setMessData(response.data.data);
      setEditingMess(false);
      alert("Mess details updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update mess details");
    }
  };

  // Submit handler for food details
  const onSubmitFood = async (data) => {
    try {
      const response = await api.put(`/api/mess/${code}/food`, data);
      setWeeklyFoodData(response.data.data);
      setEditingFood(false);
      alert("Food details updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update food details");
    }
  };

  // Add new worker field
  const addWorker = () => {
    const workerCount = messData.workers?.length || 0;
    setValue(`workers[${workerCount}].name`, "");
    setValue(`workers[${workerCount}].mobileNumber`, "");
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center p-5 text-red-500">{error}</div>;

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];
  const mealLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    eveningSnacks: "Evening Snacks",
    dinner: "Dinner",
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mess Details</h1>

      {/* Mess Details Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">General Information</h2>
          <button
            onClick={() => setEditingMess(!editingMess)}
            className={`px-4 py-2 rounded ${editingMess ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
          >
            {editingMess ? "Cancel" : "Update Mess Details"}
          </button>
        </div>

        {editingMess ? (
          <form onSubmit={handleSubmit(onSubmitMess)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Mess Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full p-2 border rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Location</label>
                <input
                  {...register("location")}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1">Capacity</label>
                <input
                  type="number"
                  {...register("capacity", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Capacity must be positive" },
                  })}
                  className="w-full p-2 border rounded"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Mess Code</label>
                <input
                  value={messData.code}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block mb-1">Hostel</label>
                <input
                  value={messData.hostel.name}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Notice</label>
              <textarea
                {...register("notice")}
                className="w-full p-2 border rounded"
                rows="3"
              ></textarea>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium">Workers</label>
                <button
                  type="button"
                  onClick={addWorker}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Add Worker
                </button>
              </div>

              {messData.workers &&
                messData.workers.map((worker, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <input
                        {...register(`workers[${index}].name`)}
                        placeholder="Worker Name"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`workers[${index}].mobileNumber`)}
                        placeholder="Mobile Number"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Mess Name:</p>
              <p>{messData?.name}</p>
            </div>
            <div>
              <p className="font-semibold">Mess Code:</p>
              <p>{messData?.code}</p>
            </div>
            <div>
              <p className="font-semibold">Hostel:</p>
              <p>{messData?.hostel.name}</p>
            </div>
            <div>
              <p className="font-semibold">Location:</p>
              <p>{messData?.location || "Not specified"}</p>
            </div>
            <div>
              <p className="font-semibold">Capacity:</p>
              <p>{messData?.capacity}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold">Notice:</p>
              <p>{messData?.notice || "No notice available"}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold mb-2">Workers:</p>
              {messData?.workers && messData.workers.length > 0 ? (
                <ul className="space-y-1">
                  {messData.workers.map((worker, index) => (
                    <li key={index}>
                      {worker.name} - {worker.mobileNumber}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No workers assigned</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Food Schedule Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Weekly Food Schedule</h2>
          <button
            onClick={() => setEditingFood(!editingFood)}
            className={`px-4 py-2 rounded ${editingFood ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
          >
            {editingFood ? "Cancel" : "Update Food Details"}
          </button>
        </div>

        {editingFood ? (
          <form onSubmit={handleSubmitFood(onSubmitFood)} className="space-y-4">
            {days.map((day, dayIndex) => (
              <div key={day} className="mb-6 border-b pb-4">
                <h3 className="text-lg font-medium mb-3">{day}</h3>
                <input
                  type="hidden"
                  {...registerFood(`meals[${dayIndex}].day`)}
                  value={day}
                />

                {mealTypes.map((mealType) => {
                  const mealData = weeklyFoodData?.meals.find(
                    (m) => m.day === day
                  )?.[mealType];

                  return (
                    <div key={`${day}-${mealType}`} className="mb-4">
                      <h4 className="font-medium mb-2">
                        {mealLabels[mealType]}
                      </h4>

                      <div className="mb-2">
                        <label className="block text-sm mb-1">
                          Items (comma separated)
                        </label>
                        <input
                          {...registerFood(
                            `meals[${dayIndex}].${mealType}.items`
                          )}
                          className="w-full p-2 border rounded"
                          placeholder="Rice, Dal, Vegetable Curry"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm mb-1">Hour</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            {...registerFood(
                              `meals[${dayIndex}].${mealType}.timing.hour`,
                              {
                                valueAsNumber: true,
                                min: 1,
                                max: 12,
                              }
                            )}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            {...registerFood(
                              `meals[${dayIndex}].${mealType}.timing.minute`,
                              {
                                valueAsNumber: true,
                                min: 0,
                                max: 59,
                              }
                            )}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">AM/PM</label>
                          <select
                            {...registerFood(
                              `meals[${dayIndex}].${mealType}.timing.am_pm`
                            )}
                            className="w-full p-2 border rounded"
                          >
                            <option value="am">AM</option>
                            <option value="pm">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save Food Schedule
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Day/Time</th>
                  <th className="py-2 px-4 border">Breakfast</th>
                  <th className="py-2 px-4 border">Lunch</th>
                  <th className="py-2 px-4 border">Evening Snacks</th>
                  <th className="py-2 px-4 border">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayData = weeklyFoodData?.meals.find(
                    (meal) => meal.day === day
                  );

                  return (
                    <tr key={day}>
                      <td className="py-2 px-4 border font-medium">{day}</td>
                      {mealTypes.map((mealType) => {
                        const mealData = dayData?.[mealType];

                        return (
                          <td
                            key={`${day}-${mealType}`}
                            className="py-2 px-4 border"
                          >
                            <div>
                              <p className="font-medium">
                                {mealData?.timing?.hour || "-"}:
                                {String(
                                  mealData?.timing?.minute || "00"
                                ).padStart(2, "0")}
                                {mealData?.timing?.am_pm || ""}
                              </p>
                              <ul className="text-sm">
                                {mealData?.items?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessDetails;
