-- skill_projects, phases, topics

create table skill_projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  goal            text,
  level           text,
  timeline_months integer,
  streak          integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index skill_projects_user_id_idx on skill_projects (user_id);

create table phases (
  id               uuid primary key default gen_random_uuid(),
  skill_project_id uuid not null references skill_projects(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  order_index      integer not null,
  name             text not null,
  status           text not null default 'not_started'
    check (status in ('not_started', 'current', 'complete')),
  created_at       timestamptz not null default now(),
  unique (skill_project_id, order_index)
);

create index phases_skill_project_id_idx on phases (skill_project_id);

create table topics (
  id          uuid primary key default gen_random_uuid(),
  phase_id    uuid not null references phases(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_index integer not null,
  label       text not null,
  done        boolean not null default false,
  unique (phase_id, order_index)
);

create index topics_phase_id_idx on topics (phase_id);
