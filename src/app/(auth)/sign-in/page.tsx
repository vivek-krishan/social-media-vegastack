"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { EyeClosed, Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/signIn.schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { PLATFORM_NAME } from "@/helpers/constants";

const SignInPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Zod implementation
  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setLoading(true);

    const response = await signIn("credentials", {
      identifier: data.email,
      password: data.password,
      redirect: false,
    });

    if (response?.error) {
      toast.error("Invalid credentials");
    } else if (response?.url) {
      toast.success("Login successful");
      router.replace(`/`);
    }

    setLoading(false);
  };

  return (
    <div className=' h-screen w-screen flex items-center justify-center'>
      <div className='w-[40%] p-10 rounded-2xl drop-shadow-xl bg-black/10'>
        <div className='Heading w-full flex flex-col justify-center items-center mb-20'>
          <h1 className='text-center text-xl font-bold font-serif'>
            Welcome Back to {PLATFORM_NAME}
          </h1>
          <span className='text-center text-sm text-gray-500'>
            Please Enter you email/username and password for sign in
          </span>
        </div>
        <Form {...signInForm}>
          <form
            onSubmit={signInForm.handleSubmit(onSubmit)}
            className='space-y-8'
          >
            <FormField
              name='email'
              control={signInForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={signInForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl className='relative'>
                    <Input
                      placeholder='Enter your password'
                      {...field}
                      // type={showPassword ? "text" : "password"}
                      type='password'
                    />
                  </FormControl>
                  {/* <div className='relative -top-10 left-[100%] '>
                    {showPassword ? (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(true);
                        }}
                      >
                        <EyeClosed />
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(false);
                        }}
                      >
                        <Eye />
                      </Button>
                    )}
                  </div> */}

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className="cursor-pointer" disabled={loading}>
              {loading ? <Loader className='animate-spin' /> : "Submit"}
            </Button>
          </form>
        </Form>
        <div className='mt-5 text-center flex justify-center items-center'>
          <h4>Not a member of our platform</h4>
          <Link href='/sign-up'>
            <Button variant='link' className='text-blue-600 cursor-pointer'>
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
