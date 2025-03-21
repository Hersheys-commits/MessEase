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
      auth: {
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
