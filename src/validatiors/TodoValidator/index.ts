import joi from "joi";

export const createTodoSchema = joi.object({
  message: joi.string().required().messages({
    "string.base": "message must be a string",
    "any.required": "message is required",
    "string.empty": "message cannot be empty",
  }),
});
