"use client";

import React, { useState } from "react";
import { Image, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createPostSchema } from "@/schemas/createPost.schema";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

export type CreatePostFormValues = z.infer<typeof createPostSchema>;

interface PostCreateProps {
  onSubmitPost?: (data: CreatePostFormValues) => void; // optional callback
}

const PostCreate = ({ onSubmitPost }: PostCreateProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loader, setLoader] = useState(false);

  const { data: session } = useSession();
  const user: User = session?.user as User;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      caption: "",
      image: undefined,
    },
  });

  // Watch image field for preview

  const onSubmit = async (data: CreatePostFormValues) => {

    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("caption", data.caption);
      formData.append("image", data.image as File);

      const post = await axios.post("/api/posts/", formData);
      toast.success("Image Posted");
    } catch (error) {
      console.log("Error in posting the post:", error);
      toast.error("Error in posting image!");
    } finally {
      setLoader(false);
    }

    reset();
    setPreview(null);
  };

  // Handle preview update
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className='bg-[#212228] rounded-lg p-4 mb-6'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex items-start'>
        {/* User avatar */}
        <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2'>
          <span className='font-bold'>{user?.name?.at(0)?.toUpperCase()}</span>
        </div>
        <div className='flex-1'>
          {/* Caption input */}
          <div className='flex flex-col gap-3'>
            <textarea
              {...register("caption")}
              placeholder="What's on your mind?"
              className='w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 resize-none'
              rows={2}
            />
            {errors.caption && (
              <p className='text-red-500 text-xs'>{errors.caption.message}</p>
            )}

            {/* Image input trigger */}
            <label
              htmlFor='postImageInput'
              className='flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white text-sm'
            >
              <Image size={18} /> Upload Image
            </label>

            {/* Hidden file input */}
            <input
              id='postImageInput'
              type='file'
              accept='image/jpeg, image/png'
              {...register("image")}
              onChange={handleImageChange}
              className='hidden'
            />

            {errors.image && (
              <p className='text-red-500 text-xs'>
                {errors.image.message as string}
              </p>
            )}

            {/* Image preview */}
            {preview && (
              <div className='mt-2 flex flex-col w-fit gap-1'>
                <X
                  className='self-end cursor-pointer'
                  onClick={() => setPreview(null)}
                />
                <img
                  src={preview}
                  alt='Preview'
                  className='max-h-40 w-fit rounded-md border border-gray-700'
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex items-center justify-between mt-4'>
            <div className='flex space-x-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md'
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostCreate;
