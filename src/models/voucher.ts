import mongoose from "mongoose";
const voucherSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  voucher_code: { type: String, required: true, unique: true },
  issued_to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  issued_at: { type: Date, default: Date.now },
  status: {
    type: String,
    required: true,
    enum: ["active", "used"],
    default: "active",
  },
  isDelete: { type: Boolean, required: false, default: false },
});
export const Voucher = mongoose.model("Voucher", voucherSchema);
