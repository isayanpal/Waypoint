-- portfolio_projects, portfolio_project_phases

create table portfolio_projects (
  id               uuid primary key default gen_random_uuid(),
  skill_project_id uuid not null references skill_projects(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  order_index      integer not null,
  name             text not null,
  timeline         text,
  difficulty       text,
  status           text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'complete')),
  description      text,
  hook             text,
  proves           text,
  stack            text[],
  created_at       timestamptz not null default now()
);

create index portfolio_projects_skill_project_id_idx on portfolio_projects (skill_project_id);

create table portfolio_project_phases (
  portfolio_project_id uuid not null references portfolio_projects(id) on delete cascade,
  phase_id             uuid not null references phases(id) on delete cascade,
  primary key (portfolio_project_id, phase_id)
);
