"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const URL_ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Error de configuración en el servidor.",
  CredentialsSignin: "Usuario o PIN incorrectos. Verifique e intente de nuevo.",
};

export function LoginForm({ urlError }: { urlError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    urlError ? URL_ERROR_MESSAGES[urlError] ?? "No se pudo entrar." : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim(),
      pin: pin.trim(),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(URL_ERROR_MESSAGES.CredentialsSignin);
      return;
    }

    router.push("/planificador");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="su-correo@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="Correo registrado para ingresar a tu agenda." 
      />
      <Input
        label="PIN de acceso"
        type="password"
        name="pin"
        autoComplete="current-password"
        required
        inputMode="numeric"
        placeholder="Su PIN personal"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      {error && (
        <p className="rounded-2xl bg-red-50 p-4 text-base text-red-800" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Entrando…" : "Entrar a AgroSemanal"}
      </Button>
      <p className="text-center text-base text-stone-600">
        ¿No tienes cuenta? <Link href="/register" className="font-semibold text-agro-700 hover:text-agro-800">Regístrate aquí</Link>
      </p>
    </form>
  );
}
