// controllers/adminController.js
import User from "../model/user.model.js";
import College from "../model/college.model.js";
import { OAuth2Client } from "google-auth-library";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store OTPs in memory
const otpStore = new Map();

// Configure nodemailer transporter
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

// Admin Registration Controller with OTP
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

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

    // Prepare email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Admin Account Verification OTP",
      html: `
          <h2>Your OTP Verification Code</h2>
          <p>Hello ${name},</p>
          <p>Your OTP for admin account verification is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
      `,
    };

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (error) {
      console.error("SMTP verification failed:", error);
    }

    // Send OTP email
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Email error details:", error);
      return res
        .status(500)
        .json({ message: "Failed to send OTP email", error: error.message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify Admin OTP Controller
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp, password, name, phoneNumber } = req.body;

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

    // Create a new admin user
    const adminUser = new User({
      email,
      password,
      name,
      phoneNumber,
      role: "admin", // explicitly setting role to admin
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;

    const user = { email, name, phoneNumber, role: "admin" };

    await adminUser.save();

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Admin registered successfully",
        accessToken,
        refreshToken,
        user,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

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

// Admin Login Controller
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the admin user by email and ensure the role is admin
    const adminUser = await User.findOne({ email, role: "admin" });
    if (!adminUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password using the schema method
    const isMatch = await adminUser.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    const user = {
      email,
      role: "admin",
      phoneNumber: adminUser.phoneNumber,
      name: adminUser.name,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCollege = async (req, res) => {
  try {
    const adminId = req.user._id; // Assuming you have middleware that sets `req.user`

    // Fetch the admin user with the associated college
    const adminUser = await User.findById(adminId).populate("college");

    if (!adminUser || !adminUser.college) {
      console.log("No college found");
      return res
        .status(205)
        .json({ message: "No college found or college not requested." });
    }

    const college = adminUser.college;

    // Check if the college is verified
    if (college.status !== "verified") {
      return res.status(207).json({ message: "College is not verified yet." });
    }

    return res.status(200).json({ college });
  } catch (error) {
    console.error("Error fetching college:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// Admin Google Auth Controller
export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub, picture } = ticket.getPayload();

    // Note: No domain check for admins, as requested

    let admin = await User.findOne({ googleId: sub, role: "admin" }).select(
      "-password -refreshToken"
    );
    let existingAdmin = await User.findOne({
      email: email,
      role: "admin",
    }).select("googleId");

    if (existingAdmin && !existingAdmin.googleId) {
      return res
        .status(210)
        .json(
          new ApiResponse(
            210,
            { error: "email exists" },
            "Email already exists"
          )
        );
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    if (admin) {
      const accessToken = admin.generateAccessToken();
      const refreshToken = admin.generateRefreshToken();

      admin.refreshToken = refreshToken;
      await admin.save();

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: admin, accessToken, refreshToken },
            "Admin logged in successfully"
          )
        );
    } else {
      admin = await User.create({
        fullName: name,
        googleId: sub,
        email,
        role: "admin",
      });

      const accessToken = admin.generateAccessToken();
      const refreshToken = admin.generateRefreshToken();

      admin.refreshToken = refreshToken;
      await admin.save();

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: admin, accessToken, refreshToken },
            "Admin signed in successfully"
          )
        );
    }
  } catch (error) {
    console.error("Google Authentication Error (Admin):", error);
    throw new ApiError(401, error?.message || "Google Login Failed");
  }
};

// Admin Logout Controller
export const logoutAdmin = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

export const verifyToken = async (req, res) => {
  return res.status(200).json({
    user: req.user._id,
  });
};

// Get admin profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get college details if admin has a college association
  let collegeDetails = null;
  if (user.college) {
    collegeDetails = await College.findById(user.college).populate({
      path: "admins",
      select: "name email profilePicture",
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, collegeDetails },
        "Admin profile fetched successfully"
      )
    );
});

// Update admin profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber } = req.body;

  if (!name && !phoneNumber && !req.file) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

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

  const cloudinaryResponse = await uploadOnCloudinary(profilePicturePath);

  if (!cloudinaryResponse?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePicture: cloudinaryResponse.url,
        name,
        phoneNumber,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});
