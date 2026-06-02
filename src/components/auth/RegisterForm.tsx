"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pin, name }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok || !result.ok) {
      setStatus({ type: "error", text: result.error || "No se pudo crear la cuenta." });
      return;
    }

    setStatus({ type: "success", text: "Cuenta creada con éxito. Ya puedes iniciar sesión." });
    setEmail("");
    setPin("");
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre o el de tu negocio"
      />
      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu-correo@ejemplo.com"
      />
      <Input
        label="PIN de acceso"
        type="password"
        name="pin"
        inputMode="numeric"
        required
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="4 a 6 dígitos"
      />
      {status && (
        <p
          className={`rounded-2xl p-4 text-base ${
            status.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
          }`}
          role="status"
        >
          {status.text}
        </p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Creando cuenta…" : "Registrar cuenta"}
      </Button>
      <p className="text-center text-base text-stone-600">
        ¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-agro-700 hover:text-agro-800">Inicia sesión</Link>
      </p>
    </form>
  );
}
