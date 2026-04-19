# Setup Ambiente de Desarrollo

## Prerequisitos
- Tener acceso al dashboard de Supabase
- Tener el proyecto de producción (`fj-gastos-2`) ya configurado

---

## 1. Crear proyecto dev en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Nombre: `fj-gastos-dev`
3. Guardar la contraseña de la DB
4. Esperar a que el proyecto se inicialice

---

## 2. Aplicar el schema

En el SQL Editor del proyecto dev, correr las migraciones en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_expense_tags.sql`
3. `supabase/migrations/003_payment_distribution.sql` → cuando pregunte, elegir **"Run and enable RLS"**
4. `supabase/migrations/004_payment_distribution_per_month.sql`
5. `supabase/migrations/005_payment_distribution_hidden.sql`
6. `supabase/migrations/006_budget_months_locked.sql`
7. `supabase/migrations/007_payment_distribution_rls.sql`

---

## 3. Configurar variables de entorno

Crear `.env.development.local` en la raíz del proyecto con las keys del proyecto dev:

```
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto-dev>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dev>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-dev>
```

Las keys se encuentran en: **Project Settings → API**

> `.env.local` se usa en producción, `.env.development.local` se usa en `npm run dev`.

---

## 4. Crear usuarios de prueba

### Usuario Julio (Google)
No se puede replicar automáticamente — Julio debe iniciar sesión con Google una vez
en el ambiente dev para que se cree su cuenta ahí.

### Usuario Flor (email/password)
Correr este script desde la terminal (requiere que `.env.development.local` tenga el `SUPABASE_SERVICE_ROLE_KEY`):

```bash
node -e "
const url = '<SUPABASE_URL_DEV>/auth/v1/admin/users'
const key = '<SERVICE_ROLE_KEY_DEV>'

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'apikey': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'flor@test.com', password: 'flor1234', email_confirm: true })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
"
```

Credenciales del usuario de prueba:
- **Email:** `flor@test.com`
- **Password:** `flor1234`

---

## 5. Verificar que estás en dev

Al correr `npm run dev`, debe aparecer una barra amarilla en la parte superior de la app:

> **DEV — base de datos de prueba**

Si no aparece, revisar que `.env.development.local` esté correctamente configurado.

---

## Resumen de ambientes

| Ambiente | Comando | Archivo de env |
|---|---|---|
| Desarrollo | `npm run dev` | `.env.development.local` |
| Producción | deploy | `.env.local` |
