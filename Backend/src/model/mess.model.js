<<<<<<< HEAD
import  mongoose,{ Schema } from "mongoose";

const MessSchema = new Schema({
    name: { 
      type: String, 
      required: true,
    },
    hostel: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hostel', 
      required: true, 
    },
    admins: [{
        type: Schema.Types.ObjectId, 
        ref: 'User' ,
    }],
    workers:[{
        name:{
            type: String,
        },
        mobileNumber:{
            type: String,
        }
    }],
    mess:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mess'
    }],
    foodRecords: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'WeeklyFood' 
    }], 
  },{
    timestamps:true,
=======
const MessSchema = new mongoose.Schema({
    name: { type: String, required: true },
        hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
        admins: [{
      permissions: [{
        type: String,
        // enum: ['manageMenu', 'trackAttendance', 'viewPayments', 'handleComplaints']
        enum:['manageMenu', 'manageMess', 'manageComplaints']
      }]
    }],
    foodRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WeeklyFood' }], // Stores weekly food records
    createdAt: { type: Date, default: Date.now }
>>>>>>> eb6774fd623166eb2135baa6f095250fa0a4ab2f
  });
  

const Mess = mongoose.model("Mess", MessSchema);
  
export default Mess;