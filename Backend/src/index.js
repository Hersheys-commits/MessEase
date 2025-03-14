import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js"; // MongoDB connection
import adminRoutes from "./route/admin.route.js";
import collegeRoutes from "./route/college.route.js";
import studentRoutes from "./route/student.route.js";
import guestRoutes from './route/guest.route.js';
import hostelRoutes from "./route/hostel.route.js";
dotenv.config({ path: "./.env" });

const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser()); // Middleware to parse cookies

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend (adjust if needed)
    credentials: true, // Allow cookies
  })
);



// MongoDB Connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed: ", err);
  });

// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/student",studentRoutes);
app.use("/api/hostel",hostelRoutes);
app.use("/api/guest",guestRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
