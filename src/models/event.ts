import mongoose from "mongoose";
export interface IEvent extends Document {
  event_name: string;
  max_vouchers: number;
  issued_vouchers: number;
  editing_user?: mongoose.Schema.Types.ObjectId | null;
  editing_expire_time?: Date | null;
  isDelete: boolean;
}
const eventSchema = new mongoose.Schema({
  event_name: { type: String, required: true },
  max_vouchers: { type: Number, required: true },
  issued_vouchers: { type: Number, default: 0 },
  editing_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  editing_expire_time: {
    type: Date,
    default: null,
  },
  isDelete: { type: Boolean, required: false, default: false },
});
export const Event = mongoose.model<IEvent>("Event", eventSchema);
