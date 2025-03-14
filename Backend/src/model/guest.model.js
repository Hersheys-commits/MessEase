import mongoose, { Schema } from "mongoose";

const GuestRoomSchema = new Schema({
    hostel: { 
        type: Schema.Types.ObjectId, 
        ref: 'Hostel', 
        required: true 
    },
    roomNumber: { 
        type: String, 
        required: true 
    },
    guest: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    checkInDate: { 
        type: Date, 
        required: true 
    },
    checkOutDate: { 
        type: Date ,
        required:true
    },
    status: { 
        type: String, 
        enum: ["occupied", "available", "reserved"], 
        default: "reserved" 
    },
    purpose: { 
        type: String 
    }
}, { timestamps: true });

const GuestRoom = mongoose.model("GuestRoom", GuestRoomSchema);
export default GuestRoom;


// import mongoose from "mongoose";


// const guestRoomSchema = new mongoose.Schema(
//   { 
//     occupant: {
//       // i think the size of room should be fixed 2 so dont put because guest are majority times parents so thinking not to put the size of room
//       user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//       checkInDate: { type: Date, required: true },
//       checkOutDate: { type: Date, required: true },
//     },
//     hostel: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Hostel",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const GuestRoom = mongoose.model("GuestRoom", guestRoomSchema);
// export default GuestRoom;


// // import { Schema } from "mongoose";

// // const GuestRoomBookingSchema = new Schema({
// //   hostel: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'Hostel',
// //       required: true
// //   },
// //   roomNumber: {
// //       type: String,
// //       required: true
// //   },
// //   student: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //   },
// //   bookingDate: {
// //       type: Date,
// //       required: true
// //   },
// //   checkInDate: {
// //       type: Date,
// //       required: true
// //   },
// //   checkOutDate: {
// //       type: Date,
// //       required: true
// //   },
// //   status: {
// //       type: String,
// //       enum: ['pending', 'confirmed', 'cancelled', 'completed'],
// //       default: 'pending'
// //   },
// //   // purpose: {
// //   //     type: String,
// //   //     required: true
// //   // }
// // }, {
// //   timestamps: true
// // });

// // // Add a compound index to prevent double bookings
// // GuestRoomBookingSchema.index(
// //   { hostel: 1, roomNumber: 1, checkInDate: 1, checkOutDate: 1 },
// //   { unique: true }
// // );

// // // Static method to check availability
// // GuestRoomBookingSchema.statics.checkAvailability = async function(hostelId, date) {
// //   const hostel = await mongoose.model('Hostel').findById(hostelId);
// //   if (!hostel || !hostel.guestRooms || hostel.guestRooms.count === 0) {
// //       return { available: false, message: "No guest rooms in this hostel" };
// //   }
  
// //   // Get all bookings for the specified date
// //   const bookings = await this.find({
// //       hostel: hostelId,
// //       $or: [
// //           // Check if the requested date falls within any existing booking
// //           { 
// //               checkInDate: { $lte: date },
// //               checkOutDate: { $gte: date }
// //           }
// //       ],
// //       status: { $in: ['pending', 'confirmed'] }
// //   });
  
// //   // Get all room numbers in use for that date
// //   const bookedRooms = bookings.map(booking => booking.roomNumber);
  
// //   // Find available rooms
// //   const availableRooms = hostel.guestRooms.roomNumbers.filter(
// //       room => !bookedRooms.includes(room)
// //   );
  
// //   return {
// //       available: availableRooms.length > 0,
// //       availableRooms: availableRooms,
// //       totalGuestRooms: hostel.guestRooms.count,
// //       bookedRooms: bookedRooms
// //   };
// // };

// // const GuestRoom = mongoose.model("GuestRoomBooking", GuestRoomBookingSchema);

// // export default GuestRoom;