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
  


const Hostel = mongoose.model("Hostel", HostelSchema);
  
export default Hostel;
  