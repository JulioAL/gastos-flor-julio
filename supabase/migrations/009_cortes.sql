CREATE TABLE IF NOT EXISTS public.cortes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  settled_date date DEFAULT CURRENT_DATE,
  year int NOT NULL,
  month int NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.corte_account_totals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  corte_id uuid REFERENCES public.cortes ON DELETE CASCADE NOT NULL,
  account_key text NOT NULL,
  total_amount decimal(10,2) NOT NULL
);

ALTER TABLE public.personal_expenses ADD COLUMN IF NOT EXISTS corte_id uuid REFERENCES public.cortes ON DELETE SET NULL;

ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corte_account_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cortes_auth" ON public.cortes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "corte_account_totals_auth" ON public.corte_account_totals FOR ALL USING (auth.role() = 'authenticated');
