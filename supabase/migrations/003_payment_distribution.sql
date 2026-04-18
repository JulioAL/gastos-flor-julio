CREATE TABLE public.payment_distribution (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gasto_egreso text NOT NULL DEFAULT '',
  julio decimal(10,2),
  flor decimal(10,2),
  casita decimal(10,2),
  power decimal(10,2),
  limpieza decimal(10,2),
  regalos decimal(10,2),
  flor_y_julio decimal(10,2),
  navidad decimal(10,2),
  gasolina decimal(10,2),
  entretenimiento decimal(10,2),
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
