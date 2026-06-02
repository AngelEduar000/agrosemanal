import { Resend } from "resend";

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY ?? undefined;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "onboarding@resend.dev";
}

export function createResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
}
