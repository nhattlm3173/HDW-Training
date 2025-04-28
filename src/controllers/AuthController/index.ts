import { IUser } from "../../interface/IUser";
import { User } from "../../models/user";
import bcrypt from "bcrypt";
import { createUserSchema } from "../../validatiors/UserValidator";
import jwt, {
  Jwt,
  JwtPayload,
  VerifyCallback,
  VerifyErrors,
} from "jsonwebtoken";
import { Request, Response } from "express";
import { loginUserSchema } from "../../validatiors/AuthValidator/login";
const jwtAccessKey: string = process.env.JWT_ACCESS_KEY || "";
const jwtRefreshKey: string = process.env.JWT_REFRESH_KEY || "";
const authController = {
  generateAccessToken: (user: IUser) => {
    return jwt.sign(
      {
        id: user._id,
      },
      jwtAccessKey,
      { expiresIn: "30s" }
    );
  },
  generateRefreshToken: (user: IUser) => {
    return jwt.sign(
      {
        id: user._id,
      },
      jwtRefreshKey,
      { expiresIn: "365d" }
    );
  },
  registerUser: async (req: Request, res: Response): Promise<any> => {
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
      return res.status(200).json({ user, message: ["Register successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  loginUser: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;
      const { error } = loginUserSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: ["Incorrect username!"] });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: ["Incorrect password!"] });
      }
      if (user && validPassword) {
        const userForToken: IUser = {
          _id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          username: user.username,
          accessToken: "",
        };
        const accessToken = authController.generateAccessToken(userForToken);
        const refreshToken = authController.generateRefreshToken(userForToken);
        // refreshTokens.push(refreshToken);
        const oneYearInSeconds = 365 * 24 * 60 * 60;
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + oneYearInSeconds * 1000);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
          expires: expireDate,
        });
        // const { password, ...other } = user.toObject();
        userForToken.accessToken = accessToken;
        return res.status(200).json({ userForToken });
      }
    } catch (err) {
      return res.status(500).json({ message: [err] });
    }
  },
  requestRefreshToken: async (req: Request, res: Response): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: ["You're not authenticated"] });
    const callback: VerifyCallback = async (
      error: VerifyErrors | null,
      decoded: string | Jwt | JwtPayload | undefined
    ): Promise<void> => {
      const user = decoded as IUser;
      const user1 = await User.findOne({ _id: user._id });
      if (!user1) {
        res.status(403).json({ message: ["You're not authenticated"] });
        return;
      }
      if (error) {
        res.status(401).json({ message: [error] });
        return;
      }
      // refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefeshToken = authController.generateRefreshToken(user);
      // refreshTokens.push(newRefeshToken);
      const oneYearInSeconds = 365 * 24 * 60 * 60;
      const expireDate = new Date();
      expireDate.setTime(expireDate.getTime() + oneYearInSeconds * 1000);
      res.cookie("refreshToken", newRefeshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
        expires: expireDate,
      });
      res.status(200).json({ accessToken: newAccessToken });
      return;
    };
    jwt.verify(refreshToken, jwtRefreshKey, callback);
  },
};
