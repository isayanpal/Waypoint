-- rate-limit log table

create table ai_generations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index ai_generations_user_id_created_at_idx on ai_generations (user_id, created_at);
