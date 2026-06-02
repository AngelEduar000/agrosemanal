# AgroSemanal

Aplicación web personal para un agrónomo independiente: pedidos, planificación semanal, bitácora de campo y reportes por correo.

## Características

- **Acceso seguro** con correo + PIN (un solo usuario autorizado)
- **Pedidos** con prioridad, estado, filtros por semana y exportación Excel
- **Planificador** de 7 días con entregas y labores de campo
- **Bitácora diaria** con recordatorio por correo
- **Resumen semanal** automático los viernes (Vercel Cron)

## Diseño

Interfaz pensada para uso cómodo en móvil y escritorio: letra grande (18px base), botones amplios, textos claros en español, colores sobrios verde-agro y alto contraste.

## Requisitos

- Node.js 20+
- Cuenta [Neon](https://neon.tech) (PostgreSQL)
- Cuenta [Resend](https://resend.com) (correo)
- Cuenta [Vercel](https://vercel.com) (despliegue)

## Configuración local

1. Copie `.env.example` a `.env.local` y complete las variables.
2. Instale dependencias y cree las tablas:

```bash
cd agrosemanal
npm install
npx prisma db push
npm run db:seed
```

3. Inicie la aplicación:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Variables importantes

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de PostgreSQL (Neon) |
| `NEXTAUTH_URL` | URL pública de la app |
| `AUTH_SECRET` | Mismo valor que `NEXTAUTH_SECRET` |
| `NEXTAUTH_SECRET` | Secreto aleatorio largo |
| `AUTHORIZED_EMAIL` | Único correo que puede entrar (exacto al iniciar sesión) |
| `AUTH_RESEND_KEY` | **Obligatorio** para magic link (API key Resend) |
| `RESEND_API_KEY` | Notificaciones (puede ser la misma key) |
| `EMAIL_FROM` | Remitente en Resend |
| `CRON_SECRET` | Protege rutas `/api/cron/*` en Vercel |

Guía detallada: ver **[CONFIGURACION.md](./CONFIGURACION.md)**.

**Login:** `AUTHORIZED_EMAIL` + `LOGIN_PIN` (no usa correo para entrar).

**Notificaciones:** `RESEND_API_KEY` + `EMAIL_FROM` → resumen semanal y recordatorio de bitácora.

## Despliegue en Vercel

1. Suba el repositorio a GitHub.
2. Importe el proyecto en Vercel (carpeta `agrosemanal`).
3. Configure las mismas variables de entorno.
4. Los cron jobs están definidos en `vercel.json` (viernes 23:00 UTC ≈ 6pm Colombia; recordatorio diario 22:00 UTC).

En el plan Hobby de Vercel, verifique que los cron estén habilitados.

## Seguridad

- No suba `.env.local` al repositorio.
- Si expuso la contraseña de la base de datos, **rótela en Neon** y actualice `DATABASE_URL`.

## Estructura

```
src/
  app/          # Páginas y API
  actions/      # Server actions
  components/   # UI reutilizable
  lib/          # Utilidades, correo, fechas
prisma/         # Esquema PostgreSQL
```
