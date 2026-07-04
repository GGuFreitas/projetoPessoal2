create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  telegram_chat_id text,
  created_at timestamptz not null default now()
);
