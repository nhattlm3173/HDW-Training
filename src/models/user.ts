import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  isDelete: { type: Boolean, required: false, default: false },
});
export const User = mongoose.model("User", userSchema);
