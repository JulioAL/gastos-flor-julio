ALTER TABLE public.payment_distribution
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
