create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references contas(id) on delete cascade,
  canal text not null default 'telegram',
  status text not null check (status in ('enviado', 'falhou')),
  tentativas integer not null default 1,
  created_at timestamptz not null default now()
);

create index notifications_log_conta_id_idx on notifications_log (conta_id);
