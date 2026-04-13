-- ============================================================
-- Schema: Sistema de Gastos Julio & Flor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  personal_sheet_configured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Budget months (only 2026 tabs)
CREATE TABLE public.budget_months (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year int NOT NULL,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  tab_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, month)
);

-- Budget income entries
CREATE TABLE public.budget_income (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_month_id uuid REFERENCES public.budget_months ON DELETE CASCADE,
  source text NOT NULL, -- 'julio_salary' | 'flor_salary' | 'freelo' | 'other'
  description text,
  amount decimal(10,2),
  included_in_budget boolean DEFAULT true
);

-- Budget programmed expenses
-- category values match exact catalog from description.txt
CREATE TABLE public.budget_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_month_id uuid REFERENCES public.budget_months ON DELETE CASCADE,
  category text NOT NULL,
  amount decimal(10,2),
  responsible text, -- 'julio' | 'flor' | 'ambos'
  account text      -- 'casita'|'power'|'limpieza_regalos'|'entretenimiento'|'flor_julio'|'navidad'|'gaso'
);

-- Budget entertainment detail
CREATE TABLE public.budget_entertainment_detail (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_month_id uuid REFERENCES public.budget_months ON DELETE CASCADE,
  service text NOT NULL,
  description text,
  amount decimal(10,2)
);

-- Budget transfers between Julio and Flor
CREATE TABLE public.budget_transfers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_month_id uuid REFERENCES public.budget_months ON DELETE CASCADE,
  concept text,
  account text,
  julio_amount decimal(10,2),
  flor_amount decimal(10,2),
  notes text
);

-- Personal expenses (RLS enforced — each user sees only their own)
-- Each row = one expense from the Excel. Columns mirror exact Excel columns.
-- A single expense can have amounts in multiple columns simultaneously.
CREATE TABLE public.personal_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  -- Excel columns (null if not applicable)
  casita decimal(10,2),           -- → cuenta Casita
  flor_julio decimal(10,2),       -- → cuenta FlorYJulio
  julio decimal(10,2),            -- gasto personal de Julio
  flor decimal(10,2),             -- Flor le debe este monto a Julio
  salidas decimal(10,2),          -- → cuenta FlorYJulio (salidas)
  power decimal(10,2),            -- → cuenta Power
  gasolina decimal(10,2),         -- → cuenta Gaso
  regalos decimal(10,2),          -- → cuenta Limpieza y Regalos
  navidad decimal(10,2),          -- → cuenta Navidad
  otros_power decimal(10,2),      -- → Power (bono/viaje/variable según pestaña)
  entretenimiento decimal(10,2),  -- → cuenta Entretenimiento
  tab_name text,                  -- pestaña origen del Excel
  year int DEFAULT 2026,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Power account — Cuentasbanco v2 (FULL history, no year filter)
CREATE TABLE public.power_account_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_year int,
  entry_month text,               -- "Enero", "Febrero", etc.
  description text,
  carro decimal(10,2),
  ahorro_casa decimal(10,2),
  ahorro_extra decimal(10,2),
  sueldo decimal(10,2),
  cts decimal(10,2),
  intereses_ganados decimal(10,2),
  gratificaciones decimal(10,2),
  afp decimal(10,2),
  emergencia decimal(10,2),
  jf_baby decimal(10,2),
  bonos_utilidades decimal(10,2),
  salud decimal(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entertainment_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_account_entries ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Shared tables: any authenticated user can read and write
CREATE POLICY "budget_months_auth" ON public.budget_months
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "budget_income_auth" ON public.budget_income
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "budget_expenses_auth" ON public.budget_expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "budget_entertainment_auth" ON public.budget_entertainment_detail
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "budget_transfers_auth" ON public.budget_transfers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "power_account_auth" ON public.power_account_entries
  FOR ALL USING (auth.role() = 'authenticated');

-- Personal expenses: PRIVATE — each user sees only their own
CREATE POLICY "personal_expenses_own" ON public.personal_expenses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-update updated_at on personal_expenses
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personal_expenses_updated_at
  BEFORE UPDATE ON public.personal_expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Trigger: auto-create profile on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
