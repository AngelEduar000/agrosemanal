"use client";

import { useState } from "react";
import { requestLoginLink } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const URL_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Error de configuración en el servidor. Contacte al administrador.",
  AccessDenied: "Correo no autorizado o enlace inválido.",
  Verification: "El enlace expiró. Solicite uno nuevo.",
};

export function LoginForm({ urlError }: { urlError?: string | null }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    urlError ? URL_ERROR_MESSAGES[urlError] ?? "No se pudo completar el acceso." : ""
  );
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await requestLoginLink(email);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-lg bg-agro-100 p-6 text-lg text-agro-900" role="status">
        <p className="font-semibold">Correo enviado</p>
        <p className="mt-2">
          Revise la bandeja de <strong>{email.trim()}</strong> y haga clic en el enlace
          &quot;Entrar a AgroSemanal&quot;. Si no lo ve, revise correo no deseado.
        </p>
        <p className="mt-3 text-base text-stone-700">
          Con la cuenta gratuita de Resend y remitente de prueba, el correo solo llega al
          email con el que creó su cuenta en resend.com.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="Debe ser el mismo correo autorizado en la aplicación."
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-lg text-red-800" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Enviando enlace…" : "Enviar enlace de acceso"}
      </Button>
    </form>
  );
}
