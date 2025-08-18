import { z } from "zod";

export const likeSchema = z.object({
  like: z.boolean(),
});
