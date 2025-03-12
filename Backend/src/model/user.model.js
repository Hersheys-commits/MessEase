import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // This makes the index ignore documents where googleId is not set
    },
    role: {
      type: String,
      enum: ['student', 'messManager', 'accountant', 'professor', 'chiefWarden', 'developer', 'admin'],
      required: true
    },
    profilePicture: {
      type: String,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
        type: String,
    },
    blockedUntil: {
      type: Date,
      default: null
    },
    phoneNumber: String,
    lastLogin: Date
  },
  {
    timestamps: true,
  }
);

// // Middleware to update the updatedAt field on every save.
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,  // Correct syntax for MongoDB document ID
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


const User = mongoose.model("User", userSchema);

export default User;