import type { NextAuthConfig } from "next-auth";

const publicPaths = ["/login", "/login/error", "/register", "/api/auth", "/api/register"];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));
      const isApiCron = pathname.startsWith("/api/cron");
      const isLoggedIn = !!auth?.user;

      if (isApiCron) return true;

      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/planificador", request.nextUrl));
      }

      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
