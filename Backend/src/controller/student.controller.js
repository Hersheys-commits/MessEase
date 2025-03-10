import User from "../model/user.model.js";
import College from "../model/college.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { OAuth2Client } from "google-auth-library";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const otpStore = new Map();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true
  });

export const registerStudent = async (req, res) => {
  const { email, password, name } = req.body;


  //from here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   const newUser = new User({ email, password, name, role: "student" });
//   await newUser.save();

//   const accessToken = newUser.generateAccessToken();
//   const refreshToken = newUser.generateRefreshToken();

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "none",
//     path: "/",
//     maxAge: 24 * 60 * 60 * 1000,
//   };

//   res
//     .status(201)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json({ message: "Signup successful", accessToken, refreshToken });

  //to here///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const domain = email.split("@")[1];
  const college = await College.findOne({ domain });
  if (!college) return res.status(400).json({ message: "College domain doesn't exist." });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists." });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore.set(email, otp);

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
    return res.status(500).json({ message: "Failed to send OTP email", error: error.message });
  }
};

export const verifyStudentOTP = async (req, res) => {
  const { email, otp, password, name } = req.body;

  if (otpStore.get(email) != otp) return res.status(400).json({ message: "Invalid OTP." });
  otpStore.delete(email);

  const newUser = new User({ email, password, name, role: "student" });
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
      let user = await User.findOne({ googleId: sub, role: "student" }).select("-password -refreshToken");
      // Also check if a student exists with this email without googleId linked
      const userWithEmail = await User.findOne({ email, role: "student" }).select("googleId");
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

  export const verifyToken = async(req,res) => {
    return res
        .status(200)
        .json({
        user:req.user._id
        });
  }