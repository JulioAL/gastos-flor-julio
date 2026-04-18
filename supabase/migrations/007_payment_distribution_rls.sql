ALTER TABLE public.payment_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_distribution_auth" ON public.payment_distribution
  FOR ALL USING (auth.role() = 'authenticated');
