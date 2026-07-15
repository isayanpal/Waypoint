-- "owner full access" policies, one file, easy to audit

alter table profiles enable row level security;
create policy "select own profile" on profiles
  for select using (auth.uid() = id);

alter table skill_projects enable row level security;
create policy "owner full access" on skill_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table phases enable row level security;
create policy "owner full access" on phases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table topics enable row level security;
create policy "owner full access" on topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table portfolio_projects enable row level security;
create policy "owner full access" on portfolio_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table portfolio_project_phases enable row level security;
create policy "owner full access" on portfolio_project_phases
  for all using (
    exists (
      select 1 from portfolio_projects p
      where p.id = portfolio_project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from portfolio_projects p
      where p.id = portfolio_project_id and p.user_id = auth.uid()
    )
  );

alter table activity_log enable row level security;
create policy "owner full access" on activity_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table user_settings enable row level security;
create policy "owner full access" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table ai_generations enable row level security;
create policy "owner full access" on ai_generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
