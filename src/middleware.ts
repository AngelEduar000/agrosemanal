import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/login/verificar", "/login/error", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isApiCron = pathname.startsWith("/api/cron");
  const isLoggedIn = !!req.auth;

  if (isApiCron) return NextResponse.next();

  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/pedidos", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
