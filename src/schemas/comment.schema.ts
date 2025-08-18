import { z } from "zod";

export const commentSchema = z.object({
  comment: z
    .string()
    .max(100, { message: "comment can't be longer than 100 characters" }),
});
