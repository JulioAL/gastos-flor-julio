create table if not exists bank_email_log (
  id uuid primary key default gen_random_uuid(),
  gmail_message_id text unique not null,
  bank text not null,
  amount numeric not null,
  merchant text,
  card_last4 text,
  operation_number text,
  status text not null default 'ok',
  error_message text,
  processed_at timestamptz not null default now()
);

-- Only service role writes here; no public access needed
alter table bank_email_log enable row level security;
