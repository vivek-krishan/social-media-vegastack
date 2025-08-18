import { z } from "zod";

// schema for toggling following activity settings
export const followingActivitySchema = z.object({
  following: z.boolean(),
});
