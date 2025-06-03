import joi from "joi";

export const createTodoSchema = joi.object({
  title: joi.string().required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title cannot be empty",
    "any.required": "Title is required",
  }),

  description: joi.string().allow("").messages({
    "string.base": "Description must be a string",
  }),

  dueDate: joi.date().greater("now").required().messages({
    "date.base": "Due date must be a valid date",
    "date.greater": "Due date must be in the future",
    "any.required": "Due date is required",
  }),

  priority: joi.string().valid("low", "medium", "high").required().messages({
    "any.only": "Priority must be one of: low, medium, high",
    "any.required": "Priority is required",
  }),

  status: joi
    .string()
    .valid("todo", "in-progress", "done")
    .required()
    .messages({
      "any.only": "Status must be one of: todo, in-progress, done",
      "any.required": "Status is required",
    }),
});
