import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request, { Response, Test } from "supertest";
import app from "../app";
import { Event, IEvent } from "../models/event";
import { User } from "../models/user";
import { Voucher } from "../models/voucher";
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
  await Event.deleteMany({});
  await User.deleteMany({});
  await Voucher.deleteMany({});
});

describe("Event API", () => {
  it("should create an event", async () => {
    const res: Response = await authAgent
      .post("/api/events")
      .send({ event_name: "Test Event", max_vouchers: 10 });
    expect(res.status).toBe(200);
    expect(res.body.event.event_name).toBe("Test Event");
  });

  it("should return all events", async () => {
    await Event.create({ event_name: "Event 1", max_vouchers: 5 });
    const res: Response = await authAgent.get("/api/events");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
  it("should return all events of page 2", async () => {
    await Event.create({ event_name: "Event 1", max_vouchers: 5 });
    await Event.create({ event_name: "Event 2", max_vouchers: 5 });
    await Event.create({ event_name: "Event 3", max_vouchers: 5 });
    const res: Response = await authAgent.get("/api/events?page=2&limit=1");
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
  it("should return all events contain 2 in name", async () => {
    await Event.create({ event_name: "Event 1", max_vouchers: 5 });
    await Event.create({ event_name: "Event 2", max_vouchers: 5 });
    await Event.create({ event_name: "Event 3", max_vouchers: 5 });
    const res: Response = await authAgent.get("/api/events?search=2");

    expect(res.status).toBe(200);
    expect(res.body.data.some((e: IEvent) => e.event_name.includes("2"))).toBe(
      true
    );
  });

  it("should get an event by ID", async () => {
    const event = await Event.create({
      event_name: "Event 2",
      max_vouchers: 3,
    });
    const res: Response = await authAgent.get(`/api/events/${event._id}`);
    expect(res.status).toBe(200);
    expect(res.body.event_name).toBe("Event 2");
  });
  it("should response Event with id: 6810486b1cc14695b69931c4 not found", async () => {
    const event = await Event.create({
      event_name: "Event 2",
      max_vouchers: 3,
    });
    const res: Response = await authAgent.get(
      `/api/events/6810486b1cc14695b69931c4`
    );
    expect(res.status).toBe(404);
    expect(res.body).toBe("Event with id: 6810486b1cc14695b69931c4 not found");
  });

  it("should update an event", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ event_name: "Updated Event", max_vouchers: 6 });
    expect(res.status).toBe(200);
    expect(res.body.updateEvent.event_name).toBe("Updated Event");
  });
  it("should response event_name is required", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ max_vouchers: 6 });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("event_name is required");
  });
  it("should response event_name must be a string", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ event_name: 1, max_vouchers: 6 });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("event_name must be a string");
  });
  it("should response event_name cannot be empty", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ event_name: "", max_vouchers: 6 });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("event_name cannot be empty");
  });
  it("should response max_vouchers is required", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ event_name: "Updated Event" });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("max_vouchers is required");
  });
  it("should response max_vouchers must be a number", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res: Response = await authAgent
      .put(`/api/events/${event._id}`)
      .send({ event_name: "Updated Event", max_vouchers: "test" });
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toBe("max_vouchers must be a number");
  });

  it("should soft delete an event", async () => {
    const event = await Event.create({
      event_name: "To Delete",
      max_vouchers: 5,
    });
    const res: Response = await authAgent.delete(`/api/events/${event._id}`);
    expect(res.status).toBe(200);
    expect(res.body.updateEvent.isDelete).toBe(true);
  });
  it("should response Event with id: 6810486b1cc14695b69931c4 not found", async () => {
    const event = await Event.create({
      event_name: "To Delete",
      max_vouchers: 5,
    });
    const res: Response = await authAgent.delete(
      `/api/events/6810486b1cc14695b69931c4`
    );
    expect(res.status).toBe(404);
    expect(res.body).toBe("Event with id: 6810486b1cc14695b69931c4 not found");
  });

  it("should request a voucher", async () => {
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Voucher Event",
      max_vouchers: 10,
    });
    const res: Response = await authAgent
      .post("/api/events/request-voucher")
      .send({ userId: user._id, eventId: event._id });
    // console.log(res);

    expect(res.status).toBe(200);
    expect(res.body.voucher_code).toBeDefined();
  });
  it("should response Event not found", async () => {
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Voucher Event",
      max_vouchers: 10,
    });
    const res: Response = await authAgent
      .post("/api/events/request-voucher")
      .send({ userId: user._id, eventId: "6810486b1cc14695b69931c4" });
    // console.log(res);

    expect(res.status).toBe(456);
    expect(res.body.message).toBe("Event not found");
  });
  it("should response Voucher limit reached", async () => {
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Voucher Event",
      max_vouchers: 0,
    });
    const res: Response = await authAgent
      .post("/api/events/request-voucher")
      .send({ userId: user._id, eventId: event._id });
    // console.log(res);

    expect(res.status).toBe(456);
    expect(res.body.message).toBe("Voucher limit reached");
  });
  it("should response Voucher limit reached", async () => {
    const user = await User.create({
      email: "nhocnhat0200@gmail.com",
      phoneNumber: "0786571364",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Voucher Event",
      max_vouchers: 1,
    });
    const [res1, res2] = await Promise.all([
      authAgent
        .post("/api/events/request-voucher")
        .send({ userId: user._id, eventId: event._id }),
      authAgent
        .post("/api/events/request-voucher")
        .send({ userId: user._id, eventId: event._id }),
    ]);
    // console.log("Res1:", res1.status, res1.body);
    // console.log("Res2:", res2.status, res2.body);

    expect([res1.status, res2.status]).toContain(200);
    expect([res1.body.event_id, res2.body.event_id]).toContain(
      event._id.toString()
    );
    expect([res1.status, res2.status]).toContain(456);
    expect([res1.body.message, res2.body.message]).toContain(
      "Voucher limit reached"
    );
  });

  it("should request edit access", async () => {
    const user = await User.create({
      email: "nhocnhat0201@gmail.com",
      phoneNumber: "0786571365",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Editable Event",
      max_vouchers: 2,
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/me`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Editable granted");
  });
  it("should response Event not found", async () => {
    const user = await User.create({
      email: "nhocnhat0201@gmail.com",
      phoneNumber: "0786571365",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Editable Event",
      max_vouchers: 2,
    });
    const res: Response = await authAgent
      .post(`/api/events/${"6810486b1cc14695b69931c4"}/editable/me`)
      .send({ userId: user._id });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  it("should response Another user is editing this event.", async () => {
    const user = await User.create({
      email: "nhocnhat0201@gmail.com",
      phoneNumber: "0786571365",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Editable Event",
      max_vouchers: 2,
      editing_user: "6810486b1cc14695b69931c4",
      editing_expire_time: new Date(new Date().getTime() + 5 * 60 * 1000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/me`)
      .send({ userId: user._id });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Another user is editing this event.");
  });

  it("should release edit lock", async () => {
    const user = await User.create({
      email: "nhocnhat0202@gmail.com",
      phoneNumber: "0786571366",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Release Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/release`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Edit released");
  });
  it("should response Event not found", async () => {
    const user = await User.create({
      email: "nhocnhat0202@gmail.com",
      phoneNumber: "0786571366",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Release Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${"6810486b1cc14695b69931c4"}/editable/release`)
      .send({ userId: user._id });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  it("should response You are not the editing user", async () => {
    const user = await User.create({
      email: "nhocnhat0202@gmail.com",
      phoneNumber: "0786571366",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Release Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/release`)
      .send({ userId: "6810486b1cc14695b69931c4" });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You are not the editing user");
  });

  it("should maintain edit lock", async () => {
    const user = await User.create({
      email: "nhocnhat0203@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Maintain Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/maintain`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Edit maintained");
  });
  it("should response Event not found", async () => {
    const user = await User.create({
      email: "nhocnhat0203@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Maintain Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${"6810486b1cc14695b69931c4"}/editable/maintain`)
      .send({ userId: user._id });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  it("should response Edit session expired or not owned by user", async () => {
    const user = await User.create({
      email: "nhocnhat0203@gmail.com",
      phoneNumber: "0786571369",
      username: "nhat",
      password: "123456",
    });
    const event = await Event.create({
      event_name: "Maintain Lock",
      max_vouchers: 2,
      editing_user: user._id,
      editing_expire_time: new Date(Date.now() + 10000),
    });
    const res: Response = await authAgent
      .post(`/api/events/${event._id}/editable/maintain`)
      .send({ userId: "6810486b1cc14695b69931c4" });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Edit session expired or not owned by user");
  });
});
