const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    phoneNumber: { type: String },
    address: { type: String },
    avatar: { type: String },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    status: {
      type: Number,
      default: 1,
      enum: [0, 1],
    },
    likedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    userType: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
