-- activity_log, user_settings

create table activity_log (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  skill_project_id uuid not null references skill_projects(id) on delete cascade,
  occurred_on      date not null,
  weight           integer not null default 1,
  unique (skill_project_id, occurred_on)
);

create index activity_log_user_id_idx on activity_log (user_id);

create table user_settings (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  theme             text not null default 'indigo_ink'
    check (theme in ('indigo_ink', 'graphite_gold', 'emerald_slate')),
  sidebar_collapsed boolean not null default false
);
