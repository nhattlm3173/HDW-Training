import { Request, Response } from "express";
import { Event } from "../../models/event";
import { createEventSchema } from "../../validatiors/EventValidator";
import mongoose from "mongoose";
import { Voucher } from "../../models/voucher";
import { emailQueue } from "../../queue/emailQueue";
import { User } from "../../models/user";
import { populate } from "dotenv";
const EDITABLE_TIMEOUT_MS = 5 * 60 * 1000;
export const eventController = {
  getAllEvent: async (req: Request, res: Response): Promise<any> => {
    try {
      const event = await Event.find({ isDelete: false });
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getEventById: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const event = await Event.findOne({ _id: id, isDelete: false });
      if (!event) {
        return res.status(404).json(`Event with id: ${id} not found`);
      }
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAllVoucherOfEventByEventId: async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const vouchers = await Voucher.find({ event_id: id });
      if (!(vouchers.length > 0)) {
        return res.status(404).json(`Vouchers with event_id: ${id} not found`);
      }
      return res.status(200).json(vouchers);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  createEvent: async (req: Request, res: Response): Promise<any> => {
    try {
      const { event_name, max_vouchers } = req.body;

      const { error } = createEventSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }
      const newEvent = new Event({
        event_name,
        max_vouchers,
      });
      const event = await newEvent.save();
      return res
        .status(200)
        .json({ event, message: ["Event created successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateEvent: async (req: Request, res: Response): Promise<any> => {
    try {
      const { event_name, max_vouchers } = req.body;
      const { id } = req.params;
      const { error } = createEventSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }

      const updateEvent = await Event.findOneAndUpdate(
        { _id: id, isDelete: false },
        { event_name, max_vouchers },
        { new: true }
      );
      if (!updateEvent) {
        return res.status(404).json(`Event with id: ${id} not found`);
      }
      return res
        .status(200)
        .json({ updateEvent, message: ["Event updated successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  deleteEvent: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const updateEvent = await Event.findByIdAndUpdate(
        id,
        { isDelete: true },
        { new: true }
      );
      if (!updateEvent) {
        return res.status(404).json(`Event with id: ${id} not found`);
      }
      return res
        .status(200)
        .json({ updateEvent, message: ["Event deleted successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  generateVoucherCode: () => {
    return Math.random().toString(36).substring(2, 15);
  },
  requestVoucher: async (req: Request, res: Response): Promise<any> => {
    // console.log(req.body);
    for (let attempt = 0; attempt < 3; ++attempt) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { eventId, userId } = req.body;

        const event = await Event.findById(eventId).session(session);

        if (!event) throw new Error("Event not found");

        if (event.issued_vouchers >= event.max_vouchers) {
          throw new Error("Voucher limit reached");
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new Error(`User with id: ${userId} not found`);
        }
        const newVoucher = new Voucher({
          event_id: event._id,
          issued_to: userId,
          voucher_code: eventController.generateVoucherCode(),
          issued_at: new Date(),
          status: "active",
        });
        await newVoucher.save({ session });

        const updatedEvent = await Event.findOneAndUpdate(
          { _id: eventId, issued_vouchers: { $lt: event.max_vouchers } },
          { $inc: { issued_vouchers: 1 } },
          { session, new: true }
        );

        if (!updatedEvent) {
          throw new Error("No more vouchers available");
        }

        await session.commitTransaction();
        // session.endSession();

        try {
          await emailQueue.add(
            {
              email: user.email,
              voucherCode: newVoucher.voucher_code,
              eventName: event.event_name,
            },
            {
              attempts: 3,
              backoff: {
                type: "fixed",
                delay: 5000,
              },
            }
          );
        } catch (emailError) {
          console.error("Failed to queue email:", emailError);
          return res
            .status(500)
            .json({ message: "Voucher created but failed to queue email." });
        }
        return res.status(200).json(newVoucher);
      } catch (error: any) {
        await session.abortTransaction();
        // session.endSession();
        if (
          error &&
          typeof error.hasErrorLabel === "function" &&
          error.hasErrorLabel("TransientTransactionError")
        ) {
          continue;
        } else {
          return res
            .status(456)
            .json({ message: error.message || "Unknown error" });
        }
      } finally {
        session.endSession();
      }
    }
    return res
      .status(456)
      .json({ message: "Could not create voucher after retries." });
  },
  requestEdit: async (req: Request, res: Response): Promise<any> => {
    const { eventId } = req.params;
    const userId = req.body.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const now = new Date();
    if (
      !event.editing_user ||
      (event.editing_expire_time && event.editing_expire_time < now)
    ) {
      event.editing_user = userId;
      event.editing_expire_time = new Date(now.getTime() + EDITABLE_TIMEOUT_MS);
      await event.save();
      return res.status(200).json({ message: "Editable granted" });
    }

    if (event.editing_user !== userId) {
      return res
        .status(409)
        .json({ message: "Another user is editing this event." });
    }

    return res.status(200).json({ message: "Editable granted" });
  },
  releaseEdit: async (req: Request, res: Response): Promise<any> => {
    const { eventId } = req.params;
    const userId = req.body.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.editing_user?.toString() === userId) {
      event.editing_user = null;
      event.editing_expire_time = null;
      await event.save();
      return res.status(200).json({ message: "Edit released" });
    }

    return res.status(403).json({ message: "You are not the editing user" });
  },
  maintainEdit: async (req: Request, res: Response): Promise<any> => {
    const { eventId } = req.params;
    const userId = req.body.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const now = new Date();
    // console.log(event.editing_user, userId);

    if (
      event.editing_user?.toString() === userId &&
      event.editing_expire_time &&
      event.editing_expire_time > now
    ) {
      event.editing_expire_time = new Date(now.getTime() + EDITABLE_TIMEOUT_MS);
      await event.save();
      return res.status(200).json({ message: "Edit maintained" });
    }

    return res
      .status(409)
      .json({ message: "Edit session expired or not owned by user" });
  },
};
