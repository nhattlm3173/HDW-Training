import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  phoneNumber: string;
  username: string;
  accessToken: string;
}
