-- Add semantic category tags to personal_expenses
-- Both columns are nullable (existing rows get NULL = "untagged", fully backward-compatible)

ALTER TABLE public.personal_expenses
  ADD COLUMN IF NOT EXISTS category    text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subcategory text DEFAULT NULL;

-- Partial indexes for tag-based filtering (ignore NULL rows for efficiency)
CREATE INDEX IF NOT EXISTS idx_personal_expenses_category
  ON public.personal_expenses (user_id, category)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personal_expenses_subcategory
  ON public.personal_expenses (user_id, subcategory)
  WHERE subcategory IS NOT NULL;

COMMENT ON COLUMN public.personal_expenses.category    IS 'Semantic parent category (e.g. transporte, alimentacion)';
COMMENT ON COLUMN public.personal_expenses.subcategory IS 'Semantic subcategory (e.g. gasolina, supermercado)';
