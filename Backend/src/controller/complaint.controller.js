import Complaint from "../model/complaint.model.js";
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
export const createComplaint = async (req, res) => {
    try {
        const{
            description,
            category,
        }=req.body;
        const user=req.user;

        const foundUser=await User.findById(user._id);
        if(!foundUser){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const hostel = await Hostel.findById(foundUser.hostel);

        if(!hostel){
            return res.status(404).json({
                message:"Hostel not found"
            });
        }
        
        const complaint = new Complaint({
            status:ComplaintStatus.PENDING,
            User:user._id,
            description,
            category,
            images,
            Hostelcode:hostel.code
        });

        await complaint.save();
        return res.status(201).json({
            message:"Complaint created successfully",
            complaint
        });

    } catch (error) {
        console.error('Complaint submission error:', error);
        res.status(400).json({
          status: 'error',
          message: 'Failed to submit complaint',
          error: error.message
        });
    }
};

export default createComplaint;
