-- delete_skill_project(): single call site for the frontend, cascades handle children

create function delete_skill_project(p_skill_project_id uuid)
returns void
language sql
security invoker
as $$
  delete from skill_projects where id = p_skill_project_id;
$$;
