import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";

const MessForm = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      hostel: "",
      location: "",
      capacity: 100,
      workers: [{ name: "", mobileNumber: "" }],
      meals: [
        ...[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => ({
          day,
          breakfast: {
            items: [""],
            timing: { hour: 7, minute: 30, am_pm: "am" },
          },
          lunch: { items: [""], timing: { hour: 12, minute: 30, am_pm: "pm" } },
          eveningSnacks: {
            items: [""],
            timing: { hour: 4, minute: 30, am_pm: "pm" },
          },
          dinner: { items: [""], timing: { hour: 8, minute: 0, am_pm: "pm" } },
        })),
      ],
    },
  });

  const {
    fields: workerFields,
    append: appendWorker,
    remove: removeWorker,
  } = useFieldArray({
    control,
    name: "workers",
  });

  // Effect to fetch hostels without mess
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await api.post("/api/hostel/without-mess");
        setHostels(response.data);
        console.log("first", response);
      } catch (error) {
        toast.error("Failed to fetch hostels");
        console.error("Error fetching hostels:", error);
      }
    };

    fetchHostels();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const loadingToast = toast.loading("Creating mess...");

    try {
      const response = await api.post("/api/mess/create", data);
      toast.success("Mess created successfully!", { id: loadingToast });
      reset();
      navigate("/admin/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create mess", {
        id: loadingToast,
      });
      console.error("Error creating mess:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Mess</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mess Name*
              </label>
              <input
                {...register("name", { required: "Mess name is required" })}
                className="w-full p-2 border rounded"
                placeholder="Enter mess name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel*
              </label>
              <select
                {...register("hostel", { required: "Hostel is required" })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
              {errors.hostel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hostel.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                {...register("location")}
                className="w-full p-2 border rounded"
                placeholder="Enter mess location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                {...register("capacity", { min: 1 })}
                className="w-full p-2 border rounded"
                placeholder="Enter mess capacity"
              />
            </div>
          </div>
        </div>

        {/* Workers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Mess Workers</h2>

          {workerFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker Name
                </label>
                <input
                  {...register(`workers.${index}.name`)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter worker name"
                />
              </div>

              <div className="flex items-end">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    {...register(`workers.${index}.mobileNumber`)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter mobile number"
                  />
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    className="ml-2 p-2 bg-red-500 text-white rounded-md"
                    onClick={() => removeWorker(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => appendWorker({ name: "", mobileNumber: "" })}
          >
            Add Worker
          </button>
        </div>

        {/* Weekly Food Menu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Weekly Food Menu</h2>

          <div className="space-y-6">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day, dayIndex) => (
              <div key={day} className="border-b pb-4 mb-4 last:border-b-0">
                <h3 className="text-lg font-medium mb-3">{day}</h3>

                {/* Breakfast */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Breakfast</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items
                      </label>
                      <Controller
                        name={`meals.${dayIndex}.breakfast.items`}
                        control={control}
                        render={({ field }) => (
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Enter items separated by commas"
                            value={field.value.join(", ")}
                            onChange={(e) => {
                              const items = e.target.value
                                .split(",")
                                .map((item) => item.trim());
                              field.onChange(items);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hour
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          {...register(
                            `meals.${dayIndex}.breakfast.timing.hour`,
                            { min: 1, max: 12 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minute
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          {...register(
                            `meals.${dayIndex}.breakfast.timing.minute`,
                            { min: 0, max: 59 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          AM/PM
                        </label>
                        <select
                          {...register(
                            `meals.${dayIndex}.breakfast.timing.am_pm`
                          )}
                          className="w-full p-2 border rounded"
                        >
                          <option value="am">AM</option>
                          <option value="pm">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Lunch</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items
                      </label>
                      <Controller
                        name={`meals.${dayIndex}.lunch.items`}
                        control={control}
                        render={({ field }) => (
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Enter items separated by commas"
                            value={field.value.join(", ")}
                            onChange={(e) => {
                              const items = e.target.value
                                .split(",")
                                .map((item) => item.trim());
                              field.onChange(items);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hour
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          {...register(`meals.${dayIndex}.lunch.timing.hour`, {
                            min: 1,
                            max: 12,
                          })}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minute
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          {...register(
                            `meals.${dayIndex}.lunch.timing.minute`,
                            { min: 0, max: 59 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          AM/PM
                        </label>
                        <select
                          {...register(`meals.${dayIndex}.lunch.timing.am_pm`)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="am">AM</option>
                          <option value="pm">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evening Snacks */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Evening Snacks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items
                      </label>
                      <Controller
                        name={`meals.${dayIndex}.eveningSnacks.items`}
                        control={control}
                        render={({ field }) => (
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Enter items separated by commas"
                            value={field.value.join(", ")}
                            onChange={(e) => {
                              const items = e.target.value
                                .split(",")
                                .map((item) => item.trim());
                              field.onChange(items);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hour
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          {...register(
                            `meals.${dayIndex}.eveningSnacks.timing.hour`,
                            { min: 1, max: 12 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minute
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          {...register(
                            `meals.${dayIndex}.eveningSnacks.timing.minute`,
                            { min: 0, max: 59 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          AM/PM
                        </label>
                        <select
                          {...register(
                            `meals.${dayIndex}.eveningSnacks.timing.am_pm`
                          )}
                          className="w-full p-2 border rounded"
                        >
                          <option value="am">AM</option>
                          <option value="pm">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div>
                  <h4 className="text-md font-medium mb-2">Dinner</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items
                      </label>
                      <Controller
                        name={`meals.${dayIndex}.dinner.items`}
                        control={control}
                        render={({ field }) => (
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Enter items separated by commas"
                            value={field.value.join(", ")}
                            onChange={(e) => {
                              const items = e.target.value
                                .split(",")
                                .map((item) => item.trim());
                              field.onChange(items);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hour
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          {...register(`meals.${dayIndex}.dinner.timing.hour`, {
                            min: 1,
                            max: 12,
                          })}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minute
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          {...register(
                            `meals.${dayIndex}.dinner.timing.minute`,
                            { min: 0, max: 59 }
                          )}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          AM/PM
                        </label>
                        <select
                          {...register(`meals.${dayIndex}.dinner.timing.am_pm`)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="am">AM</option>
                          <option value="pm">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Mess"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessForm;
