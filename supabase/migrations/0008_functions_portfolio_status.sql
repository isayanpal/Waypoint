-- cycle_portfolio_project_status(): not_started -> in_progress -> complete -> not_started

create function cycle_portfolio_project_status(p_project_id uuid)
returns portfolio_projects
language plpgsql
security invoker
as $$
declare
  v_row portfolio_projects;
begin
  update portfolio_projects
  set status = case status
    when 'not_started' then 'in_progress'
    when 'in_progress' then 'complete'
    else 'not_started'
  end
  where id = p_project_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'portfolio project not found or not owned by caller';
  end if;

  return v_row;
end;
$$;
