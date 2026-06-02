import type { NextAuthConfig } from "next-auth";

const publicPaths = ["/login", "/login/verificar", "/login/error", "/api/auth"];

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verificar",
    error: "/login/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async signIn({ user }) {
      const authorized = process.env.AUTHORIZED_EMAIL?.toLowerCase().trim();
      const email = user.email?.toLowerCase().trim();
      if (!authorized || !email) return false;
      return email === authorized;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));
      const isApiCron = pathname.startsWith("/api/cron");
      const isLoggedIn = !!auth?.user;

      if (isApiCron) return true;

      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/pedidos", request.nextUrl));
      }

      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
