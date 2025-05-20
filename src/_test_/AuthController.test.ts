import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request, { Response, Test } from "supertest";
import app from "../app";
import { User } from "../models/user";
import TestAgent from "supertest/lib/agent";
import bcrypt from "bcrypt";
jest.setTimeout(30000);
let mongoServer: MongoMemoryReplSet;
let authAgent: TestAgent<Test>;
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "test" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});
describe("Auth API", () => {
  it("should register an account", async () => {
    const res: Response = await request(app).post("/api/auth/register").send({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("nhocnhat020@gmail.com");
  });
  it("should response Email or phone number already exists", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await request(app).post("/api/auth/register").send({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("Email or phone number already exists");
  });
  it("should login an account", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat020@gmail.com",
      password: "123456",
    });
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();

    let hasRefreshToken = false;
    if (Array.isArray(cookies)) {
      hasRefreshToken = cookies.some((cookie) =>
        cookie.startsWith("refreshToken=")
      );
    } else if (typeof cookies === "string") {
      hasRefreshToken = cookies.startsWith("refreshToken=");
    }

    expect(hasRefreshToken).toBe(true);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("nhocnhat020@gmail.com");
  });
  it("should response Incorrect username!", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat0202@gmail.com",
      password: "123456",
    });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("Incorrect username!");
  });
  it("should response Incorrect password!", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat020@gmail.com",
      password: "1234562",
    });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("Incorrect password!");
  });
  it("should response a refreshToken and accessToken", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const loginRes: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat020@gmail.com",
      password: "123456",
    });
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    let hasRefreshToken = false;
    if (Array.isArray(cookies)) {
      hasRefreshToken = cookies.some((cookie) =>
        cookie.startsWith("refreshToken=")
      );
    } else if (typeof cookies === "string") {
      hasRefreshToken = cookies.startsWith("refreshToken=");
    }

    expect(hasRefreshToken).toBe(true);

    const res: Response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);
    // console.log(res.body, cookies);
    const cookiesOfRq = res.headers["set-cookie"];
    expect(cookiesOfRq).toBeDefined();
    // console.log(cookiesOfRq, "jkkljljjljlk");

    let hasRefreshTokenOfRq = false;
    if (Array.isArray(cookiesOfRq)) {
      hasRefreshTokenOfRq = cookiesOfRq.some((cookie) =>
        cookie.startsWith("refreshToken=")
      );
    } else if (typeof cookiesOfRq === "string") {
      hasRefreshTokenOfRq = cookiesOfRq.startsWith("refreshToken=");
    }

    expect(hasRefreshTokenOfRq).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
  it("should response You're not authenticated", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const loginRes: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat020@gmail.com",
      password: "123456",
    });
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    let hasRefreshToken = false;
    if (Array.isArray(cookies)) {
      hasRefreshToken = cookies.some((cookie) =>
        cookie.startsWith("refreshToken=")
      );
    } else if (typeof cookies === "string") {
      hasRefreshToken = cookies.startsWith("refreshToken=");
    }

    expect(hasRefreshToken).toBe(true);

    const res: Response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", []);
    expect(res.status).toBe(401);
    expect(res.body.message[0]).toBe("You're not authenticated");
  });
  it("should response Your account has been deleted", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat020@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const loginRes: Response = await request(app).post("/api/auth/login").send({
      email: "nhocnhat020@gmail.com",
      password: "123456",
    });
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    let hasRefreshToken = false;
    if (Array.isArray(cookies)) {
      hasRefreshToken = cookies.some((cookie) =>
        cookie.startsWith("refreshToken=")
      );
    } else if (typeof cookies === "string") {
      hasRefreshToken = cookies.startsWith("refreshToken=");
    }

    expect(hasRefreshToken).toBe(true);
    await User.deleteOne({ _id: user._id });
    const res: Response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);
    expect(res.status).toBe(403);
    expect(res.body.message[0]).toBe("Your account has been deleted");
  });
});
