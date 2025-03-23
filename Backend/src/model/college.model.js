import mongoose, { Schema } from "mongoose";

<<<<<<< HEAD
const collegeSchema = new Schema({
   status:{
        type: String,
        enum: ['verified','unverified'],
        default: 'unverified',
        required: true,
=======
const collegeSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["verified", "unverified"],
      default: "unverified",
      required: true,
>>>>>>> newBranch
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
    },
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    contactEmail: String,
    contactPhone: String,
    website: String,
<<<<<<< HEAD
<<<<<<< HEAD
    hostel: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
=======
    hostels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    } 
    ],
  },{
=======
    hostel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
>>>>>>> newBranch
    timestamps: true,
  }
);

const College = mongoose.model("College", collegeSchema);

export default College;
