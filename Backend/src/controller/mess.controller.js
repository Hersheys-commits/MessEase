import Mess from "../model/mess.model.js";
import Hostel from "../model/hostel.model.js";
import WeeklyFood from "../model/food.model.js";
import mongoose from "mongoose";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const createMess = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      hostel: hostelId,
      location,
      capacity,
      workers,
      meals,
    } = req.body;
    console.log("first", req.body);
    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId).session(session);
    if (!hostel) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Create new mess
    const newMess = new Mess({
      name,
      hostel: hostelId,
      location,
      capacity: capacity || 100,
      workers,
      admins: req.user?._id ? [req.user._id] : [],
      code: hostel.code,
      college: req.user.college,
    });

    const savedMess = await newMess.save({ session });
    console.log("first");
    // Create weekly food record
    const weeklyFood = new WeeklyFood({
      mess: savedMess._id,
      meals: meals.map((meal) => ({
        day: meal.day,
        breakfast: {
          items: meal.breakfast.items.filter((item) => item.trim() !== ""),
          timing: meal.breakfast.timing,
        },
        lunch: {
          items: meal.lunch.items.filter((item) => item.trim() !== ""),
          timing: meal.lunch.timing,
        },
        eveningSnacks: {
          items: meal.eveningSnacks.items.filter((item) => item.trim() !== ""),
          timing: meal.eveningSnacks.timing,
        },
        dinner: {
          items: meal.dinner.items.filter((item) => item.trim() !== ""),
          timing: meal.dinner.timing,
        },
      })),
    });

    const savedWeeklyFood = await weeklyFood.save({ session });

    // Update mess with food record reference
    savedMess.foodRecords = [savedWeeklyFood._id];
    await savedMess.save({ session });

    // Update hostel with mess reference
    hostel.mess = savedMess._id;
    await hostel.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Mess created successfully",
      mess: savedMess,
      weeklyFood: savedWeeklyFood,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating mess:", error);
    res.status(500).json({
      message: "Failed to create mess",
      error: error.message,
    });
  }
};

export const fetchMessDetails = asyncHandler(async (req, res) => {
  const { code } = req.params;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code })
    .populate("hostel", "name")
    .populate("admins", "name email");

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Fetch weekly food data for the mess
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { mess, weeklyFood },
        "Mess details fetched successfully"
      )
    );
});

export const updateMessDetails = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { name, location, capacity, notice, workers } = req.body;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code });

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Update fields if provided
  if (name) mess.name = name;
  if (location) mess.location = location;
  if (capacity) mess.capacity = capacity;
  if (notice) mess.notice = notice;
  if (workers) mess.workers = workers;

  // Save updated mess
  await mess.save();

  return res
    .status(200)
    .json(new ApiResponse(200, mess, "Mess details updated successfully"));
});

export const updateWeeklyFood = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { meals } = req.body;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code });

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Find weekly food for the mess
  let weeklyFood = await WeeklyFood.findOne({ mess: mess._id });

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Update meals if provided
  if (meals) weeklyFood.meals = meals;

  // Save updated weekly food
  await weeklyFood.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        weeklyFood,
        "Weekly food details updated successfully"
      )
    );
});

const getAllMessesInCollege = asyncHandler(async (req, res) => {
  try {
    // Get the college ID from the authenticated user
    const collegeId = req.user.college;

    if (!collegeId) {
      throw new ApiError(400, "College ID not found in user data");
    }

    // Find all messes with the matching college ID
    const messes = await Mess.find({ college: collegeId })
      .populate("hostel", "name code") // Populate hostel with name and code fields
      .select("-foodRecords"); // Exclude the foodRecords array for better performance

    if (!messes || messes.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No messes found for this college"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, messes, "Messes fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching messes");
  }
});

export { getAllMessesInCollege };
