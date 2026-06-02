import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPin } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "PIN",
      credentials: {
        email: { label: "Correo", type: "email" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const pin = String(credentials?.pin ?? "").trim();

        if (!email || !pin) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          return null;
        }

        if (!verifyPin(pin, user.password)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Agro Usuario",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "owner";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
