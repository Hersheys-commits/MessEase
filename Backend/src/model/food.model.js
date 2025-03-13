import mongoose from "mongoose";

const WeeklyFoodSchema = new mongoose.Schema({
    mess: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    weekStartDate: { type: Date, required: true, unique: true }, // Monday, Tuesday , ...... , Sunday
    meals: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      breakfast: { type: String, required: true }, 
      lunch: { type: String, required: true }, 
      eveningSnacks: { type: String, required: true }, 
      dinner: { type: String, required: true }
    }],
  },{
    timestamps: true,
  });



  const WeeklyFood = mongoose.model("WeeklyFood", WeeklyFoodSchema);
  
  export default WeeklyFood;