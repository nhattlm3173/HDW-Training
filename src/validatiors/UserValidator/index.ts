import joi from "joi";

export const createUserSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.base": "email must be a string",
    "any.required": "email is required",
    "string.email": "email invalid",
    "string.empty": "email cannot be empty",
  }),
  phoneNumber: joi
    .string()
    .regex(/^(0|\+84)\d{9}$/)
    .required()
    .messages({
      "any.required": "phoneNumber is required",
      "string.pattern.base": "phoneNumber invalid",
      "string.empty": "phoneNumber cannot be empty",
      "string.base": "phoneNumber must be a string",
    }),
  username: joi.string().required().trim().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
    "string.trim": "Username cannot have spaces",
    "string.base": "Username must be a string",
  }),

  password: joi.string().min(6).required().messages({
    "any.required": "password is required",
    "string.min": "password must be at least 6 characters",
    "string.empty": "password cannot be empty",
    "string.base": "password must be a string",
  }),
  confirmPassword: joi.string().required().valid(joi.ref("password")).messages({
    "any.required": "confirm password is required",
    "any.only": "confirm password doesn't match",
    "string.empty": "confirm password cannot be empty",
    "string.base": "confirm password must be a string",
  }),
});
