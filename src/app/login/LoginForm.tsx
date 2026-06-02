"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("resend", {
      email: email.trim(),
      redirect: false,
      callbackUrl: "/pedidos",
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "No se pudo enviar el enlace. Verifique su correo o contacte al administrador."
      );
      return;
    }

    window.location.href = "/login/verificar";
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
        hint="Use el mismo correo que registró para esta aplicación."
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
