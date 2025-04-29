import joi  from "joi";

export const loginUserSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.base": "email phải là một chuỗi",
    "any.required": "email là bắt buộc",
    "string.email": "email không hợp lệ",
    "string.empty": "email không được để trống",
  }),
  password: joi.string().min(6).required().messages({
    "any.required": "password là bắt buộc",
    "string.min": "password phải có ít nhất 6 ký tự",
    "string.empty": "password không được để trống",
    "string.base": "password phải là một chuỗi",
  }),
});
