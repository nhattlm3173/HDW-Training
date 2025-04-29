import Mailjet from "node-mailjet";
import { emailQueue } from "../queue/emailQueue";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
const MAILJETPUBKEY: string = process.env.MJ_APIKEY_PUBLIC || "";
const MAILJETPRIKEY: string = process.env.MJ_APIKEY_PRIVATE || "";

emailQueue.process(async (job) => {
  const { email, voucherCode, eventName } = job.data;
  console.log("📩 Processing job:", MAILJETPUBKEY, MAILJETPRIKEY);
  const mailjet = Mailjet.apiConnect(MAILJETPUBKEY, MAILJETPRIKEY);

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "nhat.tlm3173@gmail.com",
            Name: "HDW TRAINING WEB",
          },
          To: [
            {
              Email: email,
              Name: email,
            },
          ],
          Subject: `Your Voucher for ${eventName}`,
          HTMLPart: `
            <h2>Congrats! Your voucher code is: ${voucherCode}</h2>
          `,
        },
      ],
    });

    return request.body;
  } catch (error: any) {
    console.error(`Failed to send email to ${email}`, error);
    throw new Error(`Failed to send email: ${error.message || error}`);
  }
});
