# Julio & Flor — Finance PWA

PWA personal para reemplazar Google Sheets en el manejo de finanzas del hogar. Presupuesto $0: Next.js + Supabase (free tier) + Vercel.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (App Router) |
| Hosting | Vercel free tier |
| Base de datos | Supabase free tier (PostgreSQL) |
| Autenticación | Supabase Auth + Google OAuth |
| Estilos | Tailwind CSS v4 |
| Gráficas | Recharts |
| Migración | Node.js + SheetJS (xlsx) |

## Pestañas

| Ruta | Descripción |
|------|-------------|
| `/resumen` | Resumen mensual del presupuesto: ingresos, gastos por categoría, cuentas, transferencias |
| `/gastos` | Gastos personales (privado por usuario, RLS) — filtros por mes/tipo/cuenta |
| `/dashboard` | Gráficas: torta por cuenta, barras por mes, top 5, evolución Power |
| `/cuentas` | Cuentas del presupuesto editables inline |
| `/power` | Historial completo de la cuenta Power con totales y gráfico de evolución |

## Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Para el script de migración necesitas además:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
JULIO_USER_ID=<uuid-de-julio-en-auth.users>
```

> El `JULIO_USER_ID` se obtiene desde Supabase Dashboard → Authentication → Users, después de que Julio haya hecho login al menos una vez.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

> **Node.js v25+**: los scripts en `package.json` usan `node node_modules/next/dist/bin/next` en lugar del binario `next` directamente para evitar un error de compatibilidad con el wrapper de Next.js.

Abre [http://localhost:3000](http://localhost:3000).

## Base de datos

El schema completo está en `supabase/migrations/001_initial_schema.sql`.

Para aplicarlo: Supabase Dashboard → SQL Editor → pegar y ejecutar el archivo.

### Tablas principales

- `profiles` — perfil de cada usuario
- `budget_months` — pestañas 2026 del presupuesto
- `budget_income` — ingresos por mes
- `budget_expenses` — gastos presupuestados por categoría
- `budget_entertainment_detail` — desglose de entretenimiento
- `budget_transfers` — transferencias Julio ↔ Flor
- `personal_expenses` — gastos personales (RLS: cada usuario solo ve los suyos)
- `power_account_entries` — historial completo de la cuenta Power

### RLS

- `personal_expenses`: `user_id = auth.uid()` — privado por usuario
- El resto: cualquier usuario autenticado puede leer y escribir

## Migración de datos desde Excel

Los archivos Excel deben estar en la raíz del proyecto:
- `presupuesto_flor_y_julio.xlsx` — presupuesto compartido (solo pestañas con "2026")
- `gastos_julio.xlsx` — gastos personales de Julio (pestañas en formato `DD-MM-YYYY`)

Instalar dependencias del script (solo la primera vez):

```bash
cd scripts && npm install && cd ..
```

Ejecutar migración:

```bash
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_KEY=<service-role-key> \
JULIO_USER_ID=<uuid> \
node scripts/migrate.js
```

El script es **idempotente**: borra todos los datos existentes antes de insertar, por lo que se puede correr múltiples veces sin duplicados.

### Notas de la migración

- Pestañas de gastos con nombre `DD-MM-YYYY` (ej: `03-01-2026`): las filas sin fecha usan la fecha de la pestaña como fallback.
- Pestañas de presupuesto con nombre `YYYY - Mes` (ej: `2026 - Enero`): se filtran solo las de 2026.
- Cuenta Power (`Cuentasbanco v2`): se importa el historial completo sin filtro de año.
- La columna variable en gastos (llamada "bono", "viaje", etc. según el mes) se mapea siempre a `otros_power`.

## Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google → habilitar
2. Crear credenciales OAuth en Google Cloud Console con el redirect URL de Supabase
3. Pegar Client ID y Client Secret en Supabase

## Deploy en Vercel - pending

```bash
npx vercel
```

Agregar las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el dashboard de Vercel.

## PWA (agregar a pantalla de inicio)

El `manifest.json` está en `/public/manifest.json`. Para que funcione en iOS necesitas crear los íconos:
- `/public/icons/icon-192.png`
- `/public/icons/icon-512.png`

En Safari (iOS): botón compartir → "Añadir a pantalla de inicio".
