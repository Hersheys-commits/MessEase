// controllers/adminController.js
import User from "../model/user.model.js";

// Admin Registration Controller
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

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
        secure: false,  // Only use false for local non-HTTPS testing
        sameSite: "lax",  // Use "lax" instead of "none" for non-HTTPS
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;

    const user = {email,name,phoneNumber,role: "admin"}

    await adminUser.save();

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "Admin registered successfully",accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res
        .status(500)
        .json({ message: "Server error" });
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
        secure: false,  // Only use false for local non-HTTPS testing
        sameSite: "lax",  // Use "lax" instead of "none" for non-HTTPS
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    const user = {email,role:"admin",phoneNumber: adminUser.phoneNumber, name: adminUser.name}

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res
        .status(500)
        .json({ message: "Server error" });
  }
};



export const getCollege = async (req, res) => {
    try {
        console.log("first",req.user);
        const adminId = req.user._id; // Assuming you have middleware that sets `req.user`

        // Fetch the admin user with the associated college
        const adminUser = await User.findById(adminId).populate("college");

        if (!adminUser || !adminUser.college) {
            console.log("fuck you")
            return res.status(205).json({ message: "No college found or college not requested." });
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