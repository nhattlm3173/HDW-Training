import mongoose from "mongoose";

export interface ITodo extends Document {
  message: string;
  isFinish: boolean;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    isFinish: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Todo = mongoose.model<ITodo>("Todo", todoSchema);
