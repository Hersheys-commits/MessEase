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
  });
  

const Mess = mongoose.model("Mess", MessSchema);
  
export default Mess;