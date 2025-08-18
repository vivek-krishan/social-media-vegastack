import { z } from "zod";

export const createPostSchema = z.object({
  caption: z.string().min(1, "Caption is required"),
  image: z
    .any()
    .refine(
      (file) =>
        file && typeof file.size === "number" && file.size <= 2 * 1024 * 1024,
      { message: "Image file is required and must not exceed 2 MB" }
    )
    .refine(
      (file) =>
        file &&
        typeof file.type === "string" &&
        (file.type === "image/jpeg" || file.type === "image/png"),
      { message: "Only JPG or PNG images are allowed" }
    ),
});
