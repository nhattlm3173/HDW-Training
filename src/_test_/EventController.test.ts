import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import app from "../app";
import { Event } from "../models/event";
import { User } from "../models/user";
import { Voucher } from "../models/voucher";
jest.setTimeout(30000);
let mongoServer: MongoMemoryReplSet;

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
  await Event.deleteMany({});
  await User.deleteMany({});
  await Voucher.deleteMany({});
});

describe("Event API", () => {
  it("should create an event", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ event_name: "Test Event", max_vouchers: 10 });
    expect(res.status).toBe(200);
    expect(res.body.event.event_name).toBe("Test Event");
  });

  it("should return all events", async () => {
    await Event.create({ event_name: "Event 1", max_vouchers: 5 });
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get an event by ID", async () => {
    const event = await Event.create({
      event_name: "Event 2",
      max_vouchers: 3,
    });
    const res = await request(app).get(`/api/events/${event._id}`);
    expect(res.status).toBe(200);
    expect(res.body.event_name).toBe("Event 2");
  });

  it("should update an event", async () => {
    const event = await Event.create({
      event_name: "To Update",
      max_vouchers: 5,
    });
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .send({ event_name: "Updated Event", max_vouchers: 6 });
    expect(res.status).toBe(200);
    expect(res.body.updateEvent.event_name).toBe("Updated Event");
  });

  it("should soft delete an event", async () => {
    const event = await Event.create({
      event_name: "To Delete",
      max_vouchers: 5,
    });
    const res = await request(app).delete(`/api/events/${event._id}`);
    expect(res.status).toBe(200);
    expect(res.body.updateEvent.isDelete).toBe(true);
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
    const res = await request(app)
      .post("/api/events/request-voucher")
      .send({ userId: user._id, eventId: event._id });
    // console.log(res);

    expect(res.status).toBe(200);
    expect(res.body.voucher_code).toBeDefined();
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
    const res = await request(app)
      .post(`/api/events/${event._id}/editable/me`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
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
    const res = await request(app)
      .post(`/api/events/${event._id}/editable/release`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
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
    const res = await request(app)
      .post(`/api/events/${event._id}/editable/maintain`)
      .send({ userId: user._id });
    expect(res.status).toBe(200);
  });
});
