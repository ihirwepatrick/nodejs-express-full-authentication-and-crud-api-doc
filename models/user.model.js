const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PLease Specify username"],
    },
    email: {
      type: String,
      required: true,
      default: "Undefined",
    },
    tel: {
      type: Number,
      required: true,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
