import mongoose, { Schema } from "mongoose";

const collegeSchema = new Schema({
   status:{
        type: String,
        enum: ['verified','unverified'],
        default: 'unverified',
        required: true,
    },
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    domain: {
      type: String,
      required: true,
      unique: true
    },
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    contactEmail: String,
    contactPhone: String,
    website: String,
    hostels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    }],
    admins: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: [{
        type: String,
        enum: ['manageUsers', 'manageHostels', 'manageMess', 'manageComplaints', 'viewReports']
      }]
    }],
  },{
    timestamps: true,
  });


const College = mongoose.model("College", collegeSchema);
  
export default College;
  