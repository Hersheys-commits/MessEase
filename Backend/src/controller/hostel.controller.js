import Hostel from "../model/hostel.model.js"

export const createHostel=async(req,res)=>{

    try{
        const {name,location,totalRooms,roomCapacity,guestRoomCount,collegeId,roomNumbers,userId}=req.body;
        console.log(req.body);
        let hostel = await Hostel.findOne({college: collegeId, name }); // check in same college and name
    
        if(hostel){
            return res.status(404).json({ message: "Hostel with same name already exists" });
        }

        hostel=await Hostel.create({
            name,
            location,
            totalRooms,
            roomCapacity,
            guestRooms:{
                count:guestRoomCount,
                roomNumbers
            },
            college:collegeId,
        });

        console.log("Hostel",hostel);
        return res.status(201).json({message:"Hostel Created Successfully: "});
    }
    catch(error){
        console.log(error);
        return res.status(400).json({message:"Error while creating Hostel"});
    }
}