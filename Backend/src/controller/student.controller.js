import User from "../model/user.model.js";
import College from "../model/college.model.js";
import nodemailer from "nodemailer";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import Hostel from "../model/hostel.model.js";
import Mess from "../model/mess.model.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../util/cloudinary.js";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

export const registerStudent = async (req, res) => {
  const { email, name } = req.body;

  const domain = email.split("@")[1];
  const college = await College.findOne({ domain });
  if (!college)
    return res.status(400).json({ message: "College domain doesn't exist." });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists." });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  // Store OTP with expiration timestamp (current time + 10 minutes)
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
  otpStore.set(email, { otp, expirationTime });

  // Set up automatic deletion after 10 minutes
  setTimeout(
    () => {
      // Only delete if it's the same OTP (user might have requested another one)
      if (otpStore.has(email) && otpStore.get(email).otp === otp) {
        otpStore.delete(email);
      }
    },
    10 * 60 * 1000
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    html: `
        <h2>Your OTP Verification Code</h2>
        <p>Hello ${name},</p>
        <p>Your OTP for account verification is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
    `,
  };

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (error) {
    console.error("SMTP verification failed:", error);
  }

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Email error details:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP email", error: error.message });
  }
};

export const verifyStudentOTP = async (req, res) => {
  const { email, otp, password, name } = req.body;

  const domain = email.split("@")[1];
  const findCollege = await College.findOne({ domain });

  // Check if OTP exists
  if (!otpStore.has(email)) {
    return res
      .status(400)
      .json({ message: "OTP expired or invalid. Try again." });
  }

  const storedOtpData = otpStore.get(email);

  // Check if OTP is expired
  if (Date.now() > storedOtpData.expirationTime) {
    otpStore.delete(email); // Clean up expired OTP
    return res.status(400).json({ message: "OTP expired. Try again." });
  }

  // Check if OTP matches
  if (storedOtpData.otp != otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  // OTP is valid, delete it
  otpStore.delete(email);

  const newUser = new User({
    email,
    password,
    name,
    role: "student",
    college: findCollege._id,
  });
  await newUser.save();

  const accessToken = newUser.generateAccessToken();
  const refreshToken = newUser.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "Signup successful", accessToken, refreshToken });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const domain = email.split("@")[1];
  const college = await College.findOne({ domain });
  if (!college)
    return res.status(400).json({ message: "College domain doesn't exist." });

  const existingUser = await User.findOne({ email });
  if (!existingUser)
    return res.status(400).json({ message: "User doesn't exists." });

  const otp = Math.floor(100000 + Math.random() * 900000);
  // Store OTP with expiration timestamp (current time + 10 minutes)
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
  otpStore.set(email, { otp, expirationTime });

  // Set up automatic deletion after 10 minutes
  setTimeout(
    () => {
      // Only delete if it's the same OTP (user might have requested another one)
      if (otpStore.has(email) && otpStore.get(email).otp === otp) {
        otpStore.delete(email);
      }
    },
    10 * 60 * 1000
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification for Password Reset",
    html: `
        <h2>Your OTP Verification Code</h2>
        <p>Hello ${existingUser?.name || "User"},</p>
        <p>Your OTP for account verification is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
    `,
  };

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (error) {
    console.error("SMTP verification failed:", error);
  }

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Email error details:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP email", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Check if OTP exists
    if (!otpStore.has(email)) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid. Try again." });
    }

    const storedOtpData = otpStore.get(email);

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expirationTime) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: "OTP expired. Try again." });
    }

    // Check if OTP matches
    if (storedOtpData.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid, delete it
    otpStore.delete(email);

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User doesn't exists." });

    existingUser.password = password;
    await existingUser.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(400).json({ message: "Server Error." });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: "student" });
  if (!user || !(await user.isPasswordCorrect(password))) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "Login successful", accessToken, refreshToken });
};

export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    // Verify the token from Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, sub, picture } = ticket.getPayload();

    // Extract the domain from the email and check for college existence
    const domain = email.split("@")[1];
    const college = await College.findOne({ domain });
    if (!college) {
      return res.status(220).json({ message: "College domain doesn't exist." });
    }

    // Check if a student exists with this googleId
    let user = await User.findOne({ googleId: sub, role: "student" }).select(
      "-password -refreshToken"
    );
    // Also check if a student exists with this email without googleId linked
    const userWithEmail = await User.findOne({ email, role: "student" }).select(
      "googleId"
    );
    if (userWithEmail && !userWithEmail.googleId) {
      return res.status(210).json({
        error: "email exists",
        message: "A student with this email already exists.",
      });
    }

    if (user) {
      // User exists, log them in
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user,
          accessToken,
          refreshToken,
          first: false,
          message: "User logged in successfully",
        });
    } else {
      // No user exists with this googleId; create a new student account
      user = await User.create({
        fullName: name,
        googleId: sub,
        username: email,
        email,
        profilePicture: picture,
        role: "student",
        first: true,
      });
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user,
          accessToken,
          refreshToken,
          message: "User signed in successfully",
        });
    }
  } catch (error) {
    console.error("Google Authentication Error:", error);
    return res.status(401).json({
      message: error?.message || "Google Login Failed",
    });
  }
};

/**
 * Logout User
 * Clears authentication cookies and unsets refreshToken in DB.
 * Assumes req.user is set by an authentication middleware.
 */
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const verifyToken = async (req, res) => {
  const hostelCode = await Hostel.findById(req.user.hostel).select("code");
  if (!hostelCode?.code) {
    return res.status(250).json({
      user: req.user._id,
      userInfo: req.user,
    });
  }

  return res.status(200).json({
    user: req.user._id,
    userInfo: req.user,
    code: hostelCode?.code,
  });
};

export const getStudent = async (req, res) => {
  const { id } = req.params;

  const student = await User.findById(id);

  if (!student) {
    return res.status(404).json({
      message: "Student doesnt exist with this id",
      success: false,
    });
  }

  return res.status(200).json({
    user,
    success: true,
    message: "Student retrieved successfully",
  });
};

export const checkHostelAssignment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate("hostel");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Hostel assignment checked successfully")
    );
});

// Update user profile including hostel
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, branch, year, room, phoneNumber, hostelId } = req.body;

  if (!name && !branch && !year && !room && !phoneNumber && !hostelId) {
    throw new ApiError(400, "At least one field is required for update");
  }
  const hostel = await Hostel.findById(hostelId);

  // Start building the update object
  const updateFields = {};

  if (name) updateFields.name = name;
  if (branch) updateFields.branch = branch;
  if (year) updateFields.year = year;
  if (room) updateFields.room = room;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (hostel?.mess) updateFields.mess = hostel.mess;

  // If hostelId is provided, verify it's valid
  if (hostelId) {
    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      throw new ApiError(400, "Invalid hostel ID");
    }
    updateFields.hostel = hostelId;
  }

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  // Assuming you're using multer or similar middleware for file upload
  const profilePictureFile = req.file;

  if (!profilePictureFile) {
    throw new ApiError(400, "Profile picture file is required");
  }

  // Assuming the file is saved and the path/URL is returned
  const profilePicturePath = profilePictureFile.path;

  // Add file type validation
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(profilePicturePath); // Delete the invalid file
    throw new ApiError(
      400,
      "Invalid file type. Only JPEG, PNG and GIF are allowed"
    );
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found"); // Add user check
  }

  if (user.profilePicture) {
    try {
      const oldAvatarUrl = user.profilePicture;
      const publicId = oldAvatarUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      console.log("Old avatar deleted successfully"); // Debug log
    } catch (error) {
      console.error("Error deleting old avatar:", error); // Debug log
      // Continue anyway since we want to update the avatar
    }
  }

  try {
    const cloudinaryResponse = await uploadOnCloudinary(profilePicturePath);

    if (!cloudinaryResponse?.url) {
      throw new ApiError(400, "Error while uploading avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          profilePicture: cloudinaryResponse.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Avatar image updated successfully")
      );
  } catch (error) {
    console.error("Error in avatar update:", error); // Debug log
    throw new ApiError(400, `Avatar update failed: ${error.message}`);
  }
});

// Get all students with filtering, sorting, and pagination
export const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      branch,
      year,
      hostel,
      role,
      blockStatus, // new parameter to filter active/blocked students
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    // Extract college from authenticated admin user
    const collegeId = req.user.college;

    // Base query - only get users from admin's college
    const query = { college: collegeId };

    // Add role filter - if provided, otherwise default to student roles
    if (role) {
      // If multiple roles are provided as comma-separated string
      if (role.includes(",")) {
        query.role = { $in: role.split(",") };
      } else {
        query.role = role;
      }
    } else {
      // Default to showing only student/hostelManager/messManager roles
      query.role = { $in: ["student", "hostelManager", "messManager"] };
    }

    // Add branch filter if provided
    if (branch) {
      query.branch = branch;
    }

    // Add year filter if provided
    if (year) {
      query.year = parseInt(year);
    }

    // Add hostel filter if provided
    if (hostel) {
      query.hostel = new mongoose.Types.ObjectId(hostel);
    }

    // Add block status filter if provided
    if (blockStatus) {
      if (blockStatus === "active") {
        query.isBlocked = false;
      } else if (blockStatus === "blocked") {
        query.isBlocked = true;
      }
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { room: { $regex: search, $options: "i" } },
      ];
    }

    // Determine sort direction
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Prepare sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const students = await User.find(query)
      .populate("hostel", "name") // Only populate name field from hostel
      .select("-password -refreshToken") // Exclude sensitive fields (block fields remain)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const totalCount = await User.countDocuments(query);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          students,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        },
        "Students fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching students: " + error.message);
  }
});

// Get available filter options for the admin panel
export const getFilterOptions = asyncHandler(async (req, res) => {
  try {
    const collegeId = req.user.college;

    // Get unique branches
    const branches = await User.distinct("branch", {
      college: collegeId,
      branch: { $ne: null, $ne: "" },
    });

    // Get unique years
    const years = await User.distinct("year", {
      college: collegeId,
      year: { $ne: null },
    });

    // Get hostels with names
    const hostels = await User.aggregate([
      { $match: { college: collegeId, hostel: { $ne: null } } },
      { $group: { _id: "$hostel" } },
      {
        $lookup: {
          from: "hostels",
          localField: "_id",
          foreignField: "_id",
          as: "hostelInfo",
        },
      },
      { $unwind: "$hostelInfo" },
      { $project: { _id: 1, name: "$hostelInfo.name" } },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          branches,
          years,
          hostels,
          roles: ["student", "hostelManager", "messManager"],
          blockStatusOptions: ["active", "blocked"], // new filter options for block status
        },
        "Filter options fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching filter options: " + error.message);
  }
});

// Get detailed info about a specific student
export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findById(id)
      .populate("college", "name")
      .populate("hostel", "name")
      .populate("mess", "name")
      .select("-password -refreshToken");

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if admin has access to this student (same college)
    if (
      student.college &&
      req.user.college &&
      student.college._id.toString() !== req.user.college.toString()
    ) {
      throw new ApiError(
        403,
        "You don't have permission to access this student"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student details fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error fetching student details"
    );
  }
});

// Block/Unblock a student
export const toggleBlockStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isBlocked, blockedUntil } = req.body;

  try {
    const student = await User.findById(id);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if admin has access to this student (same college)
    if (student.college.toString() !== req.user.college.toString()) {
      throw new ApiError(
        403,
        "You don't have permission to block/unblock this student"
      );
    }

    const updates = { isBlocked };
    if (isBlocked && blockedUntil) {
      updates.blockedUntil = new Date(blockedUntil);
    } else if (!isBlocked) {
      updates.blockedUntil = null;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    const message = isBlocked
      ? "Student blocked successfully"
      : "Student unblocked successfully";
    return res.status(200).json(new ApiResponse(200, updatedStudent, message));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error toggling student block status"
    );
  }
});
