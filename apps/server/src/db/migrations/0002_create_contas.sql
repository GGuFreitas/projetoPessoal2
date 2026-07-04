create table contas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nome text not null,
  valor_centavos bigint not null check (valor_centavos >= 0),
  categoria text not null,
  vencimento date not null,
  status text not null default 'pendente'
    check (status in ('rascunho', 'pendente', 'pago', 'atrasado')),
  recorrente boolean not null default false,
  boleto_pdf_path text,
  linha_digitavel text,
  pix_copia_cola text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contas_user_id_vencimento_idx on contas (user_id, vencimento);
create index contas_status_idx on contas (status);
