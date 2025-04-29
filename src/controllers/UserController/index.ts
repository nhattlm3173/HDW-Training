import { Request, Response } from "express";
import { User } from "../../models/user";
import bcrypt from "bcrypt";
import { createUserSchema } from "../../validatiors/UserValidator";
export const UserController = {
  getAllUser: async (req: Request, res: Response): Promise<any> => {
    try {
      const user = await User.find({ isDelete: false });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getUserById: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id, isDelete: false });
      if (!user) {
        return res.status(404).json(`User with id: ${id} not found`);
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  createUser: async (req: Request, res: Response): Promise<any> => {
    try {
      const salt = await bcrypt.genSalt(10);
      const { email, phoneNumber, username, password, confirmPassword } =
        req.body;

      const { error } = createUserSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }
      const existUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
        isDelete: false,
      });

      if (existUser) {
        return res.status(400).json({
          message: ["Email or phone number already exists"],
        });
      }

      const hashed = await bcrypt.hash(password, salt);
      const newUser = new User({
        email,
        phoneNumber,
        username,
        password: hashed,
      });
      const user = await newUser.save();
      return res
        .status(200)
        .json({ user, message: ["User created successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateUser: async (req: Request, res: Response): Promise<any> => {
    try {
      const salt = await bcrypt.genSalt(10);
      const { email, phoneNumber, username, password, confirmPassword } =
        req.body;
      const { id } = req.params;

      const { error } = createUserSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }

      const hashed = await bcrypt.hash(password, salt);

      const updateUser = await User.findOneAndUpdate(
        { _id: id, isDelete: false },
        { email, phoneNumber, username, password: hashed },
        { new: true }
      );
      if (!updateUser) {
        return res.status(404).json(`User with id: ${id} not found`);
      }
      return res
        .status(200)
        .json({ updateUser, message: ["User updated successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  deleteUser: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const updateUser = await User.findByIdAndUpdate(
        id,
        { isDelete: true },
        { new: true }
      );
      if (!updateUser) {
        return res.status(404).json(`User with id: ${id} not found`);
      }
      return res
        .status(200)
        .json({ updateUser, message: ["User deleted successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
