// controllers/collegeController.js
import College from "../model/college.model.js";
import User from "../model/user.model.js"
import crypto from "crypto";
import nodemailer from "nodemailer";

// Hardcoded developer email
const developerEmail = "harsh1618sharma@gmail.com";
const dev2Email="meetkorat1406@gmail.com"
// Create a new college request
export const createCollegeRequest = async (req, res) => {
  try {
    const {
      name,
      domain,
      adminPost, // admin's post in college
      website,
      contactEmail,
      contactPhone,
      address, // expects an object: { street, city, state, pincode, country }
    } = req.body;

    // Generate a unique code for the college
    const code = crypto.randomBytes(3).toString("hex");

    // Create new college object with status "unverified"
    const newCollege = new College({
      name,
      domain,
      status: "unverified",
      code,
      website,
      contactEmail,
      contactPhone,
      address,
      // admins: You could add initial admin info here if needed
    });

    await newCollege.save();

    // Find the admin user by email and ensure the role is admin
    const adminUser = await User.findOne({_id: req.user._id});
    if (!adminUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    adminUser.college=newCollege._id;
    await adminUser.save()


    // Create a transporter (configure with your email provider credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    // Prepare email content for the developer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: developerEmail,
      subject: "New College Request Verification",
      html: `
        <h2>New College Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Domain:</strong> ${domain}</p>
        <p><strong>Admin Post:</strong> ${adminPost}</p>
        <p><strong>Website:</strong> ${website}</p>
        <p><strong>Contact Email:</strong> ${contactEmail}</p>
        <p><strong>Contact Phone:</strong> ${contactPhone}</p>
        <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}</p>
        <p>To verify or reject this college request, click <a href="http://localhost:5173/college/verify/${code}">here</a>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(201)
      .json({ message: "College request created. Awaiting verification." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch college details using the unique code (for developer verification page)
export const getCollegeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json(college);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const applyRole = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      role,// Email of the user applying for the role
      email,
      collegeName,
      applicationDetails,
    } = req.body;
    // console.log("Code:", code);
    console.log("Role:", role);
    console.log("Email:", email);
    console.log("College Name:", collegeName);
    console.log("Application Details:", applicationDetails.collegeCode);

    // Create a transporter (configure with your email provider credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email (sender)
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email (your email)
      to: dev2Email, // Recipient's email (the user applying for the role)
      subject: "Role Application Confirmation", // Email subject
      html: `
        <h2>Role Application Confirmation</h2>
        <p>Here are the details:</p>
        <ul>
          <li><strong>Role:</strong> ${role}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>College Name:</strong> ${collegeName}</li>
          <li><strong>Applied At:</strong> ${applicationDetails.appliedAt}</li>
        </ul>
          <div style="margin-top: 20px;">
          <a href="http://localhost:4001/api/college/joinReq/${applicationDetails.collegeCode}/${email}/${role}/accept" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin-right: 10px; border-radius: 4px;">Accept</a>
          <a href="http://localhost:4001/api/college/joinReq/${applicationDetails.collegeCode}/reject" style="background-color: #f44336; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Reject</a>
        </div> `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.status(200).json({
      success: true,
      message: "Role application submitted successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error in applyRole:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });

  }
};

export const ReqAccept = async (req, res) => {
  try {
    const { code, role, email } = req.params;
    console.log(code);
    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Add user to admins array
    college.admins.push(user._id);
    await college.save();
    
    // Update user's role
    user.role = role;
    await user.save();
    
    return res.status(200).json({ message: "User added as admin and role updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error in req accept" });
  }
};

export const ReqReject = async (req, res) => {
  try {
    const { code } = req.params;
    
    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
  
    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error in req reject" });
  }
};
// Developer verifies or rejects the college request
export const verifyCollege = async (req, res) => {
  try {
    const { code } = req.params;
    const { decision } = req.body; // decision: "verify" or "reject"

    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Create a transporter for sending email notifications
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (decision === "verify") {
      // Verify the college and update status
      college.status = "verified";
      await college.save();

      // Send notification email to the college admin contact email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: college.contactEmail,
        subject: "College Verified",
        html: `<p>Success! Your college "${college.name}" has been verified. You can now access college features.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "College verified successfully." });
    } else if (decision === "reject") {
      // Delete the college request
      await College.deleteOne({ code });

      // Set the admin's college field to null
      const admin = await User.findOne({ college: college._id });
      if (admin) {
        admin.college = null;
        await admin.save();
      }

      // Send rejection email to the college admin
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: college.contactEmail,
        subject: "College Request Rejected",
        html: `<p>Your request for college "${college.name}" has been rejected.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "College request rejected and deleted." });
    } else {
      return res.status(400).json({ message: "Invalid decision" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

