// controllers/collegeController.js
import College from "../model/college.model.js";
import User from "../model/user.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

// Hardcoded developer email
const developerEmail = "harsh1618sharma@gmail.com";
const dev2Email = "meetkorat1406@gmail.com";

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

    // Find the admin user by email and ensure the role is admin
    const adminUser = await User.findOne({ _id: req.user._id });
    if (!adminUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
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
      admins: [adminUser._id],
    });

    await newCollege.save();

    adminUser.college = newCollege._id;
    await adminUser.save();

    // Create a transporter (configure with your email provider credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    // Format the address nicely
    const formattedAddress = `${address.street}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;

    // Get current date for the email
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Prepare email content with styled buttons
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: developerEmail, // Use environment variable for developer email
      subject: `New College Verification Request: ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>College Verification Request</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-container {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              overflow: hidden;
            }
            .email-header {
              background-color: #3949ab;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .college-info {
              background-color: white;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .info-row {
              margin-bottom: 10px;
              border-bottom: 1px solid #f0f0f0;
              padding-bottom: 10px;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              color: #333;
            }
            .action-buttons {
              display: table;
              width: 100%;
              margin: 20px 0;
              table-layout: fixed;
            }
            .button-cell {
              display: table-cell;
              padding: 10px;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
              text-align: center;
            }
            .verify-button {
              background-color: #4CAF50;
              color: white;
            }
            .reject-button {
              background-color: #F44336;
              color: white;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              padding: 20px;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>New College Verification Request</h2>
              <p>Submitted on ${currentDate}</p>
            </div>
            
            <div class="email-body">
              <p>A new college has requested verification on your platform. Please review the details below:</p>
              
              <div class="college-info">
                <div class="info-row">
                  <div class="label">College Name:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="info-row">
                  <div class="label">Domain:</div>
                  <div class="value">${domain}</div>
                </div>
                <div class="info-row">
                  <div class="label">Admin Position:</div>
                  <div class="value">${adminPost}</div>
                </div>
                <div class="info-row">
                  <div class="label">Website:</div>
                  <div class="value"><a href="${website}" target="_blank">${website}</a></div>
                </div>
                <div class="info-row">
                  <div class="label">Contact Email:</div>
                  <div class="value">${contactEmail}</div>
                </div>
                <div class="info-row">
                  <div class="label">Contact Phone:</div>
                  <div class="value">${contactPhone}</div>
                </div>
                <div class="info-row">
                  <div class="label">Address:</div>
                  <div class="value">${formattedAddress}</div>
                </div>
                <div class="info-row">
                  <div class="label">College Code:</div>
                  <div class="value">${code}</div>
                </div>
              </div>
              
              <p>Please verify or reject this college request:</p>
              
              <div class="action-buttons">
                <div class="button-cell">
                  <a href="http://localhost:4001/api/college/verification/${newCollege.code}/verify" class="button verify-button">VERIFY</a>
                </div>
                <div class="button-cell">
                  <a href="http://localhost:4001/api/college/verification/${newCollege.code}/reject" class="button reject-button">REJECT</a>
                </div>
              </div>
              
              <p>If the buttons above don't work, you can use these links:</p>
              <p>Verify: <a href="http://localhost:4001/api/college/verification/${newCollege.code}/verify">http://localhost:4001/api/college/verification/${newCollege.code}/verify</a></p>
              <p>Reject: <a href="http://localhost:4001/api/college/verification/${newCollege.code}/reject">http://localhost:4001/api/college/verification/${newCollege.code}/reject</a></p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
    const { code, decision } = req.params;

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

      return res
        .status(200)
        .json({ message: "College verified successfully." });
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

      return res
        .status(200)
        .json({ message: "College request rejected and deleted." });
    } else {
      return res.status(400).json({ message: "Invalid decision" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCollege = async (req, res) => {
  try {
    const collegeId = req.user.college;

    if (!collegeId) {
      return res
        .status(400)
        .json({ message: "College not assigned to user.", success: false });
    }

    const college = await College.findById(collegeId);

    if (!college) {
      return res
        .status(401)
        .json({ message: "College doesnt exist with this ID", success: false });
    }

    return res.status(200).json({
      message: "college fetched successfully",
      college,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update college details
export const updateCollegeDetails = asyncHandler(async (req, res) => {
  const { name, logo, address, contactEmail, contactPhone, website } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is an admin
  if (user.role !== "admin") {
    throw new ApiError(
      403,
      "Unauthorized access. Only admins can update college details"
    );
  }

  if (!user.college) {
    throw new ApiError(404, "No college associated with this admin");
  }

  const college = await College.findById(user.college);

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  // Handle logo upload if provided
  if (req.files && req.files.logo) {
    const logoFile = req.files.logo;
    const logoUpload = await uploadOnCloudinary(logoFile.path);

    if (logoUpload) {
      college.logo = logoUpload.url;
    }
  } else if (logo) {
    college.logo = logo;
  }

  // Update other fields if provided
  if (name) college.name = name;

  if (address) {
    college.address = {
      ...college.address,
      ...address,
    };
  }

  if (contactEmail) college.contactEmail = contactEmail;
  if (contactPhone) college.contactPhone = contactPhone;
  if (website) college.website = website;

  await college.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, college, "College details updated successfully")
    );
});
