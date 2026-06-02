"use server";

import { signIn } from "@/auth";
import { getResendApiKey } from "@/lib/resend-client";
import { AuthError } from "next-auth";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Falta configuración en el servidor (correo o URL). Revise las variables en Vercel.",
  AccessDenied:
    "Este correo no está autorizado. Use exactamente el correo registrado para AgroSemanal.",
  Verification:
    "El enlace ya no es válido o expiró. Solicite uno nuevo.",
  Default: "No se pudo enviar el correo. Intente de nuevo en unos minutos.",
};

export async function requestLoginLink(email: string) {
  const normalized = email.toLowerCase().trim();
  const authorized = process.env.AUTHORIZED_EMAIL?.toLowerCase().trim();

  if (!normalized) {
    return { ok: false as const, error: "Escriba su correo electrónico." };
  }

  if (!getResendApiKey()) {
    return {
      ok: false as const,
      error:
        "El servicio de correo no está configurado. En Vercel añada AUTH_RESEND_KEY (o RESEND_API_KEY) con su API key de Resend.",
    };
  }

  if (!authorized) {
    return {
      ok: false as const,
      error: "Falta AUTHORIZED_EMAIL en el servidor. Configúrelo en Vercel.",
    };
  }

  if (!process.env.NEXTAUTH_URL) {
    return {
      ok: false as const,
      error: "Falta NEXTAUTH_URL en Vercel (ej. https://su-app.vercel.app).",
    };
  }

  if (normalized !== authorized) {
    return {
      ok: false as const,
      error:
        "Este correo no está autorizado. Debe usar el mismo correo configurado como AUTHORIZED_EMAIL.",
    };
  }

  try {
    await signIn("resend", {
      email: normalized,
      redirect: false,
    });
    return { ok: true as const };
  } catch (err) {
    console.error("[auth] requestLoginLink:", err);

    if (err instanceof AuthError) {
      const msg =
        err.message?.includes("Resend") || err.type === "AccessDenied"
          ? err.message.includes("Resend")
            ? "Resend no pudo enviar el correo. Si usa onboarding@resend.dev, solo puede enviar al correo de su cuenta Resend. Verifique EMAIL_FROM y el panel de Resend → Emails."
            : ERROR_MESSAGES[err.type] ?? ERROR_MESSAGES.Default
          : ERROR_MESSAGES[err.type] ?? ERROR_MESSAGES.Default;
      return { ok: false as const, error: msg };
    }

    if (err instanceof Error && err.message.includes("Resend")) {
      return {
        ok: false as const,
        error:
          "Resend rechazó el envío. Compruebe EMAIL_FROM (dominio verificado) y que la API key sea válida.",
      };
    }

    return { ok: false as const, error: ERROR_MESSAGES.Default };
  }
}
