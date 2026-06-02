import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email ?? "").toLowerCase().trim();
  const pin = String(body.pin ?? "").trim();
  const name = String(body.name ?? "").trim() || email.split("@")[0];

  if (!email || !pin) {
    return NextResponse.json(
      { ok: false, error: "Debes enviar un correo y un PIN válido." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { ok: false, error: "Ya existe una cuenta con ese correo." },
      { status: 400 }
    );
  }

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashPin(pin),
    },
  });

  return NextResponse.json({ ok: true });
}
