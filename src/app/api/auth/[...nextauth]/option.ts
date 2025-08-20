import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/dbConnection";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email",
          type: "text",
          placeholder: "jonsnow@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"identifier" | "password", string> | undefined
      ): Promise<any> {
        await dbConnect();

        try {
          console.log("credentials", credentials);
          const user = await UserModel.findOne({
            email: credentials?.identifier,
          });

          if (!user) throw new Error("User not found!");
          if (!user.isVerified) throw new Error("Please verify before sign-in");
          if (!user.isActive)
            throw new Error("Your account is deactivated. You cannot sign in");

          const isPasswordCorrect = await bcrypt.compare(
            credentials?.password as string,
            user.password
          );

          if (isPasswordCorrect) return user;
          else throw new Error("Incorrect password");
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.mobile = user.mobile;
        token.role = user.role;
        token.isActive = user.isActive;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.mobile = token.mobile;
        session.user.isActive = token.isActive;
        session.user.isVerified = token.isVerified;
      }

      return session;
    },
  },

  pages: {
    signIn: "/api/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
