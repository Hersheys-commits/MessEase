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
  


const Hostel = mongoose.model("Hostel", HostelSchema);
  
export default Hostel;
  