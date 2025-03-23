<<<<<<< HEAD
import  mongoose,{ Schema } from "mongoose";

const HostelSchema = new Schema({
    name: { 
        type: String, 
        required: true,
    },
    location: { 
        type: String, 
        required: true, 
    },
    totalRooms: { 
        type: Number, 
        required: true,
    },
    roomCapacity:{
        type: Number, 
        required: true,
    },
    college: { 
        type: Schema.Types.ObjectId, 
        ref: 'College', 
        required: true, 
    },
    admins: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
    }],
    workers:[{
        name:{
            type: String,
        },
        work:{
            type: String,
            enum:["roomCleaner","hostelCleaner","gardenCleaner","electrician","accountant","warden",],
        },
        mobileNumber:{
            type: String,
        }
    }],
  },
    {
        timestamps: true,
    });
=======
import  { Schema } from "mongoose";

const HostelSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    totalRooms: { type: Number, required: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // Link to Room Schema
    admins: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      permissions: [{
        type: String,
        enum: ['manageUsers', 'manageHostels', 'manageMess','manageComplaints','manageStudents', 'handleMess']  // 'assignRooms'
      }]
    }],
    createdAt: { type: Date, default: Date.now }
  });
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
  


const Hostel = mongoose.model("Hostel", HostelSchema);
  
export default Hostel;
  