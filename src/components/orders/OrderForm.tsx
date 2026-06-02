"use client";

import { useState } from "react";
import { createOrder } from "@/actions/orders";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateISO } from "@/lib/dates";

export function OrderForm() {
  const today = formatDateISO(new Date());
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    const result = await createOrder(formData);
    setPending(false);
    if (result.ok) {
      setMessage("Pedido guardado correctamente.");
      (document.getElementById("order-form") as HTMLFormElement)?.reset();
    } else {
      setMessage("Revise los campos marcados e intente de nuevo.");
    }
  }

  return (
    <Card title="Registrar nuevo pedido" subtitle="Complete todos los campos obligatorios.">
      <form id="order-form" action={handleSubmit} className="space-y-6">
        <Input label="Fecha del pedido" name="date" type="date" required defaultValue={today} />
        <Input
          label="Nombre del cliente"
          name="clientName"
          required
          placeholder="Ej.: Juan Pérez o AgroTienda El Campo"
        />
        <Select
          label="Tipo de cliente"
          name="clientType"
          options={[
            { value: "PERSONA", label: "Persona natural" },
            { value: "ALMACEN", label: "Almacén de agroinsumos" },
            { value: "FINCA", label: "Finca" },
          ]}
        />
        <Input label="Producto" name="product" required placeholder="Ej.: Fertilizante 10-30-10" />
        <Input label="Cantidad" name="quantity" required placeholder="Ej.: 20 sacos" />
        <Input
          label="Dirección de entrega"
          name="address"
          required
          placeholder="Vereda, municipio o dirección completa"
        />
        <Select
          label="Prioridad"
          name="priority"
          defaultValue="MEDIA"
          options={[
            { value: "ALTA", label: "Alta (urgente)" },
            { value: "MEDIA", label: "Media" },
            { value: "BAJA", label: "Baja" },
          ]}
        />
        <Select
          label="Estado del pedido"
          name="status"
          defaultValue="PENDIENTE"
          options={[
            { value: "PENDIENTE", label: "Pendiente" },
            { value: "EN_CAMINO", label: "En camino" },
            { value: "ENTREGADO", label: "Entregado" },
          ]}
        />
        <Textarea
          label="Notas (opcional)"
          name="notes"
          placeholder="Instrucciones especiales, horario de entrega, etc."
        />
        {message && (
          <p
            className={`rounded-lg p-4 text-lg ${
              message.includes("correctamente")
                ? "bg-agro-100 text-agro-900"
                : "bg-amber-50 text-amber-900"
            }`}
            role="status"
          >
            {message}
          </p>
        )}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Guardando…" : "Guardar pedido"}
        </Button>
      </form>
    </Card>
  );
}
