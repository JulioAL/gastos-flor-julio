ALTER TABLE public.personal_expenses
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'credito'
  CHECK (account_type IN ('credito', 'debito'));
