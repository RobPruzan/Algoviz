import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { authOptions } from "./auth-options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
