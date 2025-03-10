import User from "../model/user.model.js";
import College from "../model/college.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

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