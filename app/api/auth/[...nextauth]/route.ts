import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // allows for user id in session object
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  // FOR CUSTOM SIGN IN PAGE WE WILL NEED
  pages: {
    signIn: '/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
