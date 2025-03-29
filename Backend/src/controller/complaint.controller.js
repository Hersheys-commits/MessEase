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

        // const imageUrls=[];
        // if(files && files.length>0){
        //     const uploadPromises=files.map(async (file)=>{
        //         try {
        //             const res=await uploadOnCloudinary(file.path);
        //             if(res){
        //                 return{
        //                     url:res.secure_url
        //                 };
        //             }
        //         } catch (uploadError) {
        //             console.error('Image upload error:', uploadError);
        //             return null;
        //         }
        //     });
            
        //     const uploadResults = await Promise.all(uploadPromises);
        //     imageUrls.push(...uploadResults.filter(result => result !== null));
        // }

        let imageUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                try {
                    const result = await uploadOnCloudinary(file.path);
                    return result ? { url: result.secure_url } : null;
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return null;
                }
            });
            
            // Wait for all uploads to complete and filter out nulls
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.filter(result => result !== null);
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

export const getComplaints = async (req, res) => {
    try {
        const {code}=req.params;
        console.log(code);
        const complaint=await Complaint.find({
            Hostelcode:code,
            category:"Hostel"
        });

        console.log(complaint);
        
        if(complaint.length === 0){
            return res.status(200).json({
                message:"No Complaint"
            });
        }
        return res.status(200).json({
            complaint
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
    }
}

export const updateComplaint = async (req, res) => {
    const {id}=req.params;
    console.log(id);
    const {status}=req.params;
    console.log(status);
    const complaint=await Complaint.findById(id);
    if(!complaint){
        return res.status(404).json({
            message:"Complaint not found"
        });
    }
    console.log(complaint.status);
    // console.log(first);
    complaint.status=status;
    await complaint.save();
    return res.status(200).json({
        message:"Complaint updated successfully",
        
    });
}

export default {
    createComplaint,
    getComplaints,
    updateComplaint
};
