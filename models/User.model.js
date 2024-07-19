const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
