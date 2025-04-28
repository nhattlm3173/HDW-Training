import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User",userSchema);
module.exports = User;