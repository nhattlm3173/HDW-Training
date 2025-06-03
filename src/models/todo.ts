import mongoose, { Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  isDelete: boolean;
}

const todoSchema = new mongoose.Schema<ITodo>({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
  },
  isDelete: { type: Boolean, default: false },
});

export const Todo = mongoose.model<ITodo>("Todo", todoSchema);
