import GuestRoom from "../model/guest.model.js";
import express from "express";
import User from "../model/user.model.js";

export const checkAvailability = async (req, res) => {
  try {
    const { userId, checkInDate } = req.body;

    // Fetch user details (college & hostel)
    const user = await User.findById(userId).populate("hostel").populate("college");

    console.log("USER: ",user); // get to know the hostel in which user lives 

    if (!user || !user.hostel) {
      return res.status(404).json({ error: "User or hostel not found" });
    }

    const { hostel, college } = user;
    console.log("HOSTEL: ",hostel);
    console.log("COLLEGE: ",college);
    // Get all rooms of this hostel
    const allRooms = hostel.guestRooms.roomNumbers;
    // console.log("AllRooms: ",allRooms);
    const occupiedRooms = await GuestRoom.find({
      hostel: hostel._id,
      checkOutDate: { $gt: new Date(checkInDate) },
    }).select("roomNumber");

    // console.log("OCC ROOMS: ",occupiedRooms);
    const occupiedRoomNumbers = occupiedRooms.map(room => room.roomNumber);
    
    // Find available room numbers
    const freeRooms = allRooms.filter(room => !occupiedRoomNumbers.includes(room));
    // console.log("FREE ROOMS: ",freeRooms);
      console.log({ hostel: hostel.name, college: college.name, freeRooms });
    res.json({ hostel: hostel.name, college: college.name, freeRooms });
  } catch (error) {
    console.error("Error finding available rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const allocateRoom=async(req,res)=>{
  try {

    const { userId, roomNumber, checkInDate, checkOutDate } = req.body;
    console.log("BODY: ",req.body);
    if (!userId || !roomNumber || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId).populate("hostel").populate("college");

    const { hostel, college } = user;
    console.log("HHHH: ",hostel);
    console.log("CCCC: ",college);
    if(!hostel){
      return res.status(400).json({ error: "User is not in any hostel " });
    }
    if(!college){
      return res.status(400).json({ error: "User is not in any hostel " });
    }

    const isRoomOccupied = await GuestRoom.findOne({
      roomNumber,
      hostel:hostel._id,
      checkOutDate: { $gt: new Date(checkInDate) }, 
    });

    if (isRoomOccupied) {
      return res.status(400).json({ error: "Room is already booked" });
    }
    const bookedRoom = await GuestRoom.create({
     guest: userId,
      roomNumber,
      checkInDate,
      checkOutDate,
      hostel:hostel._id,
    });

    res.status(200).json({ message: "Room booked successfully!", bookedRoom });
  } catch (error) {
    console.error("Error booking the room:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
