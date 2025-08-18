"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ApiErrorInterface } from "@/types/ApiError";
import axios, { AxiosError } from "axios";
import { ApiResponseInterface } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { verifySchema } from "@/schemas/verifyCode.schema";

const VerifyUser = () => {
  const router = useRouter();
  const params = useParams<{ email: string }>();
  const [loading, setLoading] = useState(false);

  const verify = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setLoading(true);
      const response = await axios.post<ApiResponseInterface>(
        "/api/auth/verify-otp",
        {
          email: decodeURIComponent(params.email),
          code: data.code,
        }
      );

      toast.success(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<ApiErrorInterface>;
      toast.error(axiosError.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen w-screen flex items-center justify-center'>
      <div className='w-[40%] p-10 rounded-2xl drop-shadow-lg bg-black/10'>
        <div className='Heading-part mb-10'>
          <h1 className='text-center  text-xl font-bold font-serif'>
            Verify your account
          </h1>
          <p className='text-center text-sm text-gray-500'>
            We have sent a verification code to your email address.
          </p>
        </div>
        <Form {...verify}>
          <form
            onSubmit={verify.handleSubmit(onSubmit)}
            className='Verification-Form space-y-8'
          >
            <FormField
              name='code'
              control={verify.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification OTP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Please enter the verification code'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit'>
              {loading ? <Loader className='animate-spin' /> : "Verify"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyUser;
