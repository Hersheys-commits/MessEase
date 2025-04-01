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
      mealTimings,
    } = req.body;

    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId).session(session);
    if (!hostel) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Process meal data once to avoid repetitive operations
    const processedMeals = meals.map((meal) => ({
      day: meal.day,
      breakfast: {
        items: meal.breakfast
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        timing: mealTimings.breakfast,
      },
      lunch: {
        items: meal.lunch
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        timing: mealTimings.lunch,
      },
      eveningSnacks: {
        items: meal.eveningSnacks
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        timing: mealTimings.eveningSnacks,
      },
      dinner: {
        items: meal.dinner
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        timing: mealTimings.dinner,
      },
    }));

    // Create models and save in parallel
    const [savedMess, savedWeeklyFood] = await Promise.all([
      // Create and save new mess
      new Mess({
        name,
        hostel: hostelId,
        location,
        capacity: capacity || 100,
        workers,
        admins: req.user?._id ? [req.user._id] : [],
        code: hostel.code,
        college: req.user.college,
      }).save({ session }),

      // Create and save weekly food record
      new WeeklyFood({
        mess: null, // Temporarily null, will update after mess is created
        meals: processedMeals,
      }).save({ session }),
    ]);

    // Update references in parallel
    await Promise.all([
      // Update mess with food record reference
      Mess.findByIdAndUpdate(
        savedMess._id,
        { foodRecords: [savedWeeklyFood._id] },
        { session }
      ),

      // Update weekly food with mess reference
      WeeklyFood.findByIdAndUpdate(
        savedWeeklyFood._id,
        { mess: savedMess._id },
        { session }
      ),

      // Update hostel with mess reference
      Hostel.findByIdAndUpdate(hostelId, { mess: savedMess._id }, { session }),
    ]);

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

  // Find mess and weekly food in parallel for better performance
  const [mess, weeklyFood] = await Promise.all([
    Mess.findOne({ code })
      .populate("hostel", "name")
      .populate("admins", "name email"),

    WeeklyFood.findOne({ code }).then(
      (found) =>
        found ||
        WeeklyFood.findOne()
          .where("mess")
          .equals(Mess.findOne({ code }).select("_id"))
    ),
  ]);

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

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

  // Use findOneAndUpdate for better performance
  const updateObject = {};
  if (name) updateObject.name = name;
  if (location) updateObject.location = location;
  if (capacity) updateObject.capacity = capacity;
  if (notice) updateObject.notice = notice;
  if (workers) updateObject.workers = workers;

  const mess = await Mess.findOneAndUpdate({ code }, updateObject, {
    new: true,
  });

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, mess, "Mess details updated successfully"));
});

export const updateWeeklyFood = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { meals } = req.body;

  if (!code || !meals || !Array.isArray(meals)) {
    throw new ApiError(400, "Missing or invalid required fields");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code }).select("_id");
  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Find weekly food for the mess
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });
  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Create a map of existing meals by day for quick lookup
  const existingMealsMap = new Map(
    weeklyFood.meals.map((meal) => [meal.day, meal])
  );

  // Meal types for processing
  const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];

  // Process meals more efficiently
  const updatedMeals = meals.map((newMeal) => {
    const existingMeal = existingMealsMap.get(newMeal.day);

    if (existingMeal) {
      // For existing meals, preserve ratings and update content
      const processedMeal = { day: newMeal.day };

      mealTypes.forEach((type) => {
        if (newMeal[type]) {
          // Update items and timing, preserve ratings data
          processedMeal[type] = {
            ...newMeal[type],
            ratings: existingMeal[type]?.ratings || [],
            averageRating: existingMeal[type]?.averageRating || 0,
            ratingCount: existingMeal[type]?.ratingCount || 0,
          };
        } else if (existingMeal[type]) {
          // Keep existing meal type if not in request
          processedMeal[type] = existingMeal[type];
        }
      });

      return processedMeal;
    } else {
      // For new meals, initialize rating fields
      const processedMeal = { day: newMeal.day };

      mealTypes.forEach((type) => {
        if (newMeal[type]) {
          processedMeal[type] = {
            ...newMeal[type],
            ratings: [],
            averageRating: 0,
            ratingCount: 0,
          };
        }
      });

      return processedMeal;
    }
  });

  // Update and save
  weeklyFood.meals = updatedMeals;
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

export const getAllMessesInCollege = asyncHandler(async (req, res) => {
  try {
    // Get the college ID from the authenticated user
    const collegeId = req.user.college;

    if (!collegeId) {
      throw new ApiError(400, "College ID not found in user data");
    }

    // Find all messes with the matching college ID
    const messes = await Mess.find({ college: collegeId })
      .populate("hostel", "name code")
      .select("-foodRecords")
      .lean(); // Use lean() for better performance when we don't need Mongoose documents

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          messes.length ? messes : [],
          messes.length
            ? "Messes fetched successfully"
            : "No messes found for this college"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching messes");
  }
});

// Helper function to get current day and meal timing
export const getCurrentMealInfo = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDate = new Date();
  const currentDay = days[currentDate.getDay()];
  const currentHour = currentDate.getHours();

  // Define meal time boundaries (24-hour format)
  const breakfastEnd = 10; // 10:00 AM
  const lunchEnd = 15; // 3:00 PM
  const snacksEnd = 18; // 6:00 PM

  // Determine current meal
  let currentMeal;
  if (currentHour < breakfastEnd) {
    currentMeal = "breakfast";
  } else if (currentHour < lunchEnd) {
    currentMeal = "lunch";
  } else if (currentHour < snacksEnd) {
    currentMeal = "eveningSnacks";
  } else {
    currentMeal = "dinner";
  }

  // Determine next meal
  const nextMeal =
    currentMeal === "breakfast"
      ? "lunch"
      : currentMeal === "lunch"
        ? "eveningSnacks"
        : currentMeal === "eveningSnacks"
          ? "dinner"
          : "breakfast";

  return { currentDay, currentMeal, nextMeal };
};

// Rate a meal or update existing rating
export const rateMeal = asyncHandler(async (req, res) => {
  const { messCode, day, mealType, rating } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!messCode || !day || !mealType || !rating) {
    throw new ApiError(400, "Missing required fields");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Find mess and weekly food data
  const mess = await Mess.findOne({ code: messCode }).select("_id");
  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Use findOneAndUpdate for atomic operation
  const updateResult = await WeeklyFood.findOneAndUpdate(
    {
      mess: mess._id,
      "meals.day": day,
      [`meals.$.${mealType}`]: { $exists: true },
    },
    {
      $set: {
        [`meals.$[meal].${mealType}.ratings.$[rating].rating`]: Number(rating),
      },
    },
    {
      arrayFilters: [{ "meal.day": day }, { "rating.user": userId }],
      new: true,
    }
  );

  // If user hasn't rated before, add new rating
  if (!updateResult || !updateResult.modifiedCount) {
    const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });
    if (!weeklyFood) {
      throw new ApiError(404, "Weekly food schedule not found for this mess");
    }

    const mealIndex = weeklyFood.meals.findIndex((meal) => meal.day === day);
    if (mealIndex === -1) {
      throw new ApiError(404, `Meal schedule for ${day} not found`);
    }

    if (!weeklyFood.meals[mealIndex][mealType]) {
      throw new ApiError(404, `${mealType} is not a valid meal type`);
    }

    // Push new rating
    weeklyFood.meals[mealIndex][mealType].ratings.push({
      user: userId,
      rating: Number(rating),
    });

    await weeklyFood.save();

    // Get updated meal for response
    const updatedMeal = weeklyFood.meals[mealIndex][mealType];

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          day,
          mealType,
          rating,
          averageRating: updatedMeal.averageRating,
          ratingCount: updatedMeal.ratingCount,
        },
        "Meal rated successfully"
      )
    );
  }

  // Get the updated meal for the response
  const weeklyFood = await WeeklyFood.findOne(
    { mess: mess._id },
    { meals: { $elemMatch: { day } } }
  );

  const mealData = weeklyFood.meals[0][mealType];

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        day,
        mealType,
        rating,
        averageRating: mealData.averageRating,
        ratingCount: mealData.ratingCount,
      },
      "Rating updated successfully"
    )
  );
});

// Get a student's meal ratings for a specific mess
export const getStudentMealRatings = asyncHandler(async (req, res) => {
  const { messCode } = req.params;
  const userId = req.user._id;

  if (!messCode) {
    throw new ApiError(400, "Mess code is required");
  }

  // First, find the mess by its code
  const mess = await Mess.findOne({ code: messCode }).select("_id");
  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Use aggregation pipeline for more efficient data extraction
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });
  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Extract user's ratings using reduce for better performance
  const userRatings = weeklyFood.meals.reduce((result, meal) => {
    const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];

    result[meal.day] = mealTypes.reduce((mealResult, type) => {
      mealResult[type] =
        meal[type]?.ratings.find(
          (r) => r.user.toString() === userId.toString()
        ) || null;
      return mealResult;
    }, {});

    return result;
  }, {});

  return res
    .status(200)
    .json(
      new ApiResponse(200, { userRatings }, "User ratings fetched successfully")
    );
});

// Get mess details for student with current meal information
export const getMessDetailsForStudent = asyncHandler(async (req, res) => {
  const { messCode } = req.params;
  const userId = req.user._id;

  if (!messCode) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find the mess and weekly food in parallel
  const [mess, weeklyFood] = await Promise.all([
    Mess.findOne({ code: messCode })
      .populate("hostel", "name")
      .select("name location capacity notice workers")
      .lean(),

    WeeklyFood.findOne()
      .where("mess")
      .equals(Mess.findOne({ code: messCode }).select("_id"))
      .lean(),
  ]);

  if (!mess) {
    return res.status(250).json({
      message: "Mess not found",
      messExists: false,
    });
  }

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Get current day and meal info
  const { currentDay, currentMeal, nextMeal } = getCurrentMealInfo();

  // Find the meals using array methods instead of multiple lookups
  const todayMeal = weeklyFood.meals.find((meal) => meal.day === currentDay);
  if (!todayMeal) {
    throw new ApiError(404, `Meal schedule for ${currentDay} not found`);
  }

  // Define days array and calculate next day
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const nextDayIndex =
    nextMeal === "breakfast"
      ? (days.indexOf(currentDay) + 1) % 7
      : days.indexOf(currentDay);
  const nextDay = days[nextDayIndex];

  // Find next meal data
  const nextDayMeal = weeklyFood.meals.find((meal) => meal.day === nextDay);

  // Find user's rating for current meal
  const userCurrentMealRating = todayMeal[currentMeal]?.ratings?.find(
    (r) => r.user.toString() === userId.toString()
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        mess,
        currentMealInfo: {
          day: currentDay,
          mealType: currentMeal,
          items: todayMeal[currentMeal].items,
          timing: todayMeal[currentMeal].timing,
          averageRating: todayMeal[currentMeal].averageRating,
          userRating: userCurrentMealRating
            ? userCurrentMealRating.rating
            : null,
        },
        nextMealInfo: {
          day: nextDay,
          mealType: nextMeal,
          items: nextDayMeal[nextMeal].items,
          timing: nextDayMeal[nextMeal].timing,
          averageRating: nextDayMeal[nextMeal].averageRating,
        },
        weeklySchedule: weeklyFood.meals,
      },
      "Mess details fetched successfully for student"
    )
  );
});
