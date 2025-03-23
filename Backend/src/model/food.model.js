<<<<<<< HEAD
import mongoose from "mongoose";

=======
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
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
<<<<<<< HEAD
  },{
    timestamps: true,
=======
    createdAt: { type: Date, default: Date.now }
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
  });



  const WeeklyFood = mongoose.model("WeeklyFood", WeeklyFoodSchema);
  
  export default WeeklyFood;