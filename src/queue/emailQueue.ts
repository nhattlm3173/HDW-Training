import Bull from "bull";
import RedisMock from "ioredis-mock";
const mockRedis = new RedisMock();
export const emailQueue = new Bull("email-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});
