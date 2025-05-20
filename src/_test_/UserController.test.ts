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

  const token: string = res.body.accessToken;

  authAgent = request.agent(app);
  authAgent.set("authorization", `Bearer ${token}`);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});
describe("User API", () => {
  it("should create an user", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const res: Response = await authAgent.post("/api/users").send({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
      confirmPassword: hashed,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("nhocnhat0200@gmail.com");
  });
  it("should response Email or phone number already exists", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.post("/api/users").send({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("Email or phone number already exists");
  });
  it("should return all users", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
  it("should get an user by ID", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.get(`/api/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("nhocnhat0200@gmail.com");
  });
  it("should response User with id: 6810486b1cc14695b69931c4 not found", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.get(
      `/api/users/6810486b1cc14695b69931c4`
    );
    expect(res.status).toBe(404);
    expect(res.body).toBe("User with id: 6810486b1cc14695b69931c4 not found");
  });
  it("should update an event", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.put(`/api/users/${user._id}`).send({
      email: "nhocnhat0203@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
      confirmPassword: hashed,
    });

    expect(res.status).toBe(200);
    expect(res.body.updateUser.email).toBe("nhocnhat0203@gmail.com");
  });
  it("should response User with id: 6810486b1cc14695b69931c4 not found", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent
      .put(`/api/users/6810486b1cc14695b69931c4`)
      .send({
        email: "nhocnhat0203@gmail.com",
        phoneNumber: "0786571369",
        username: "nhat",
        password: hashed,
        confirmPassword: hashed,
      });
    expect(res.status).toBe(404);
    expect(res.body).toBe("User with id: 6810486b1cc14695b69931c4 not found");
  });
  it("should soft delete an user", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.delete(`/api/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.updateUser.isDelete).toBe(true);
  });
  it("should response Event with id: 6810486b1cc14695b69931c4 not found", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: hashed,
    });
    const res: Response = await authAgent.delete(
      `/api/users/6810486b1cc14695b69931c4`
    );
    expect(res.status).toBe(404);
    expect(res.body).toBe("User with id: 6810486b1cc14695b69931c4 not found");
  });
});
