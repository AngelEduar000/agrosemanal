import { Resend } from "resend";

/** API key para Resend: Auth.js usa AUTH_RESEND_KEY; las notificaciones usan RESEND_API_KEY. */
export function getResendApiKey(): string | undefined {
  return process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY ?? undefined;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "onboarding@resend.dev";
}

export function createResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function buildMagicLinkEmailHtml(url: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#283522;padding:24px">
      <h1 style="font-size:24px;color:#476339">AgroSemanal</h1>
      <p style="font-size:18px;line-height:1.6">
        Recibió este mensaje porque solicitó entrar a su aplicación de gestión agrícola.
      </p>
      <p style="margin:28px 0">
        <a href="${url}"
           style="display:inline-block;background:#476339;color:#fff;padding:16px 28px;
                  font-size:18px;font-weight:bold;text-decoration:none;border-radius:8px">
          Entrar a AgroSemanal
        </a>
      </p>
      <p style="font-size:16px;color:#555">
        Si no solicitó este acceso, ignore este correo. El enlace caduca en 24 horas.
      </p>
      <p style="font-size:14px;color:#888;word-break:break-all">${url}</p>
    </div>
  `;
}
