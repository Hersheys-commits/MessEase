import mongoose from "mongoose";

const WeeklyFoodSchema = new mongoose.Schema(
  {
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    meals: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        breakfast: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
        },
        lunch: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
        },
        eveningSnacks: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
        },
        dinner: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WeeklyFood = mongoose.model("WeeklyFood", WeeklyFoodSchema);

export default WeeklyFood;
