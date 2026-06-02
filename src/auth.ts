import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        const authorized = process.env.AUTHORIZED_EMAIL?.toLowerCase().trim();
        const expectedPin = process.env.LOGIN_PIN?.trim();
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const pin = String(credentials?.pin ?? "").trim();

        if (!authorized || !expectedPin) {
          console.error("[auth] Faltan AUTHORIZED_EMAIL o LOGIN_PIN en el servidor");
          return null;
        }

        if (email !== authorized || pin !== expectedPin) {
          return null;
        }

        return {
          id: "owner",
          email: authorized,
          name: "Agrónomo",
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
