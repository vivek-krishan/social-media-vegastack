import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().max(30, "Name can't be greater than 30 characters"),
  email: z.email({ message: "Invalid email address" }).max(30).min(5),
  mobile: z.coerce
    .number()
    .refine((val) => val.toString().length === 10, {
      message: "Invalid Number",
    })
    .refine((val) => val > 0, { message: "Mobile number can't be negative" }),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
      }
    ),
});
