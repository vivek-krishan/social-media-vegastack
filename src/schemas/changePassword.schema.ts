import { z } from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password is required"),
  newPassword: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
      message:
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
});
