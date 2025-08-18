"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
// import { useDebounceCallback } from "usehooks-ts";
import axios, { AxiosError } from "axios";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiErrorInterface } from "@/types/ApiError";
import { ApiResponseInterface } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader } from "lucide-react";
import { signUpSchema } from "@/schemas/signUp.schema";
import { PLATFORM_NAME } from "@/helpers/constants";

const SignUp = () => {
  const [loading, setLoading] = useState({
    isCheckingUsername: false,
    isSubmitting: false,
  });

  const router = useRouter();

  // Zod implementation
  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
    },
  });


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setLoading((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const response = await axios.post<ApiResponseInterface>(
        "/api/auth/sign-up",
        data
      );

      toast.success(response.data.message || "Success!");

      router.replace(`/verify/${data.email}`);
    } catch (error) {
      console.log("Error in sign up:", error);
      const axiosError = error as AxiosError<ApiErrorInterface>;
      toast.error(axiosError.response?.data.message);
    } finally {
      setLoading((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className=' h-screen w-screen flex items-center justify-center'>
      <div className='w-[40%] bg-black/10 p-10 rounded-2xl drop-shadow-lg'>
        <h1 className='text-center mb-10 text-xl font-bold font-serif'>
          Welcome to {PLATFORM_NAME}
        </h1>
        <Form {...signUpForm}>
          <form
            onSubmit={signUpForm.handleSubmit(onSubmit)}
            className='space-y-8'
          >
            <FormField
              name='name'
              control={signUpForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='email'
              control={signUpForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your email'
                      {...field}
                      type='email'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name='mobile'
              control={signUpForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your mobile number'
                      {...field}
                      type='number'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name='password'
              control={signUpForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your password'
                      {...field}
                      type='password'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='cursor-pointer'
              disabled={loading.isSubmitting}
            >
              {loading.isSubmitting ? (
                <Loader className='animate-spin' />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
        <div className='mt-5 text-center flex justify-center items-center'>
          <h4>Already member of our platform</h4>
          <Link href='/sign-in'>
            <Button variant='link' className='text-blue-600 cursor-pointer'>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
