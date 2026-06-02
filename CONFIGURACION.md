# Configuración paso a paso — AgroSemanal

## 1. Resend (solo para notificaciones)

1. Entra en [resend.com](https://resend.com) y crea cuenta (gratis).
2. Ve a **API Keys** → **Create API Key** → copia la key (`re_...`).
3. En **Emails** podrás ver si se enviaron los resúmenes semanales.

**Modo prueba:** con `EMAIL_FROM=onboarding@resend.dev` los correos automáticos solo llegan al email con el que creaste la cuenta Resend.

**Producción:** verifica tu dominio en Resend y usa  
`EMAIL_FROM=AgroSemanal <notificaciones@tudominio.com>`.

---

## 2. Neon (base de datos)

1. [neon.tech](https://neon.tech) → tu proyecto → **Connection string**.
2. Copia la URL que empieza por `postgresql://...`.

---

## 3. Vercel — variables de entorno

Proyecto → **Settings** → **Environment Variables** → **Production**:

| Variable | Qué poner | Ejemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de Neon | `postgresql://...` |
| `NEXTAUTH_URL` | URL de tu app | `https://agrosemanal.vercel.app` |
| `AUTH_SECRET` | Texto aleatorio largo | (generar abajo) |
| `NEXTAUTH_SECRET` | **Igual** que `AUTH_SECRET` | (el mismo) |
| `AUTHORIZED_EMAIL` | Correo del agrónomo | `juan@ejemplo.com` |
| `LOGIN_PIN` | PIN que recordará | `4829` |
| `RESEND_API_KEY` | API key de Resend | `re_...` |
| `EMAIL_FROM` | Remitente Resend | `onboarding@resend.dev` |
| `CRON_SECRET` | Texto aleatorio | cualquier frase larga |

**Generar secreto:** [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

Marca **Production** en todas. Guarda.

---

## 4. Desplegar

1. **Deployments** → último deploy → **Redeploy** (mejor sin caché).
2. Espera que termine en verde.

---

## 5. Probar el login

1. Abre `https://TU-APP.vercel.app/login`
2. Correo = exactamente `AUTHORIZED_EMAIL`
3. PIN = exactamente `LOGIN_PIN`
4. Debe entrar a **Pedidos** sin recibir correo.

Si dice "Correo o PIN incorrectos": revise mayúsculas en el correo y que el PIN en Vercel no tenga espacios extra.

---

## 6. Probar notificaciones (opcional)

Los cron envían correo automáticamente. Para probar manualmente (sustituya URL y secreto):

```text
GET https://TU-APP.vercel.app/api/cron/weekly-summary
Header: Authorization: Bearer SU_CRON_SECRET
```

También puede esperar al viernes (~6pm hora Colombia) o al recordatorio diario de bitácora.

---

## Resumen: qué hace cada cosa

| Variable | Para qué |
|----------|----------|
| `LOGIN_PIN` + `AUTHORIZED_EMAIL` | Entrar a la app |
| `RESEND_API_KEY` + `EMAIL_FROM` | Resumen semanal y recordatorio bitácora |
| `DATABASE_URL` | Guardar pedidos y bitácora |
| `AUTH_SECRET` | Sesión segura |
| `NEXTAUTH_URL` | URL correcta en producción |
| `CRON_SECRET` | Proteger rutas de cron |

**Ya no necesita:** `AUTH_RESEND_KEY` (opcional, sirve igual que `RESEND_API_KEY`).
