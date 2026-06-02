import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import {
  buildMagicLinkEmailHtml,
  createResendClient,
  getEmailFrom,
  getResendApiKey,
} from "@/lib/resend-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: getEmailFrom(),
      apiKey: getResendApiKey(),
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const apiKey = getResendApiKey();
        if (!apiKey) {
          console.error(
            "[auth] Configure AUTH_RESEND_KEY o RESEND_API_KEY en Vercel"
          );
          throw new Error("Configuration");
        }

        const resend = createResendClient();
        if (!resend) throw new Error("Configuration");

        const { data, error } = await resend.emails.send({
          from: provider.from ?? getEmailFrom(),
          to: email,
          subject: "Enlace de acceso — AgroSemanal",
          html: buildMagicLinkEmailHtml(url),
        });

        if (error) {
          console.error("[auth] Resend rechazó el envío:", error);
          throw new Error(`ResendError: ${error.message}`);
        }

        console.info("[auth] Magic link enviado a", email, "id:", data?.id);
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
