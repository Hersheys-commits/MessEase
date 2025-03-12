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
  });
  

const Mess = mongoose.model("Mess", MessSchema);
  
export default Mess;