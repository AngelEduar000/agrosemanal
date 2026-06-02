import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verificar",
    error: "/login/error",
  },
  callbacks: {
    async signIn({ user }) {
      const authorized = process.env.AUTHORIZED_EMAIL?.toLowerCase().trim();
      const email = user.email?.toLowerCase().trim();
      if (!authorized || !email) return false;
      return email === authorized;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  trustHost: true,
});
