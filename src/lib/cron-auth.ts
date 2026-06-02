import { NextRequest } from "next/server";

export function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}
