ALTER TABLE public.payment_distribution
  ADD COLUMN IF NOT EXISTS budget_month_id uuid REFERENCES public.budget_months(id) ON DELETE CASCADE;
