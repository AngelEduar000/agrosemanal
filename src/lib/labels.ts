import type { ClientType, OrderStatus, Priority } from "@prisma/client";

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  PERSONA: "Persona natural",
  ALMACEN: "Almacén de agroinsumos",
  FINCA: "Finca",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  ALTA: "Alta (urgente)",
  MEDIA: "Media",
  BAJA: "Baja",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
};

export const PRIORITY_ORDER: Priority[] = ["ALTA", "MEDIA", "BAJA"];
