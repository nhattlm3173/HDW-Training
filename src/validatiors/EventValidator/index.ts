import joi from "joi";

export const createEventSchema = joi.object({
  event_name: joi.string().required().messages({
    "string.base": "event_name must be a string",
    "any.required": "event_name is required",
    "string.empty": "event_name cannot be empty",
  }),
  max_vouchers: joi.number().required().messages({
    "any.required": "max_vouchers is required",
    "number.base": "max_vouchers must be a number",
  }),
});
