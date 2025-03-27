import Complaint from "../model/complaint.model.js";
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

const ComplaintStatus = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
};

export const createComplaint = async (req, res) => {
    try {


        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        const{
            description,
            category,
        }=req.body;
        const files=req.files;
        const user=req.user;

        console.log(description,category);

        if (!description || !category) {
            return res.status(400).json({
                message: "Description and category are required"
            });
        }


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

        const imageUrls=[];
        if(files && files.length>0){
            const uploadPromises=files.map(async (file)=>{
                try {
                    const res=await uploadOnCloudinary(file.path);
                    if(res){
                        return{
                            url:res.secure_url
                        };
                    }
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return null;
                }
            });
            
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls.push(...uploadResults.filter(result => result !== null));
        }

        console.log(1);
        const complaint = new Complaint({
            status:ComplaintStatus.PENDING,
            User:user._id,
            description:description,
            category:category,
            images:imageUrls,
            Hostelcode:hostel.code
        });
        console.log(2);
        await complaint.save();
        console.log(3);
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
