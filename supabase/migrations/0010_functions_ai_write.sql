-- create_skill_project_from_ai(): atomic write of a validated Gemini roadmap payload.
-- Called only from the /api/roadmap/generate route handler with the user's session
-- forwarded (not the service-role client), so security invoker + RLS is correct here:
-- every insert below still needs to satisfy "owner full access" on its table.
--
-- p_payload shape (already validated by the route handler's Zod schema):
-- {
--   "name": text, "goal": text, "level": text, "timelineMonths": int,
--   "phases": [ { "name": text, "topics": [text, ...] }, ... ],
--   "portfolioProjects": [
--     { "name": text, "timeline": text, "difficulty": text, "description": text,
--       "hook": text, "proves": text, "stack": [text, ...], "phaseIndices": [int, ...] }
--   ]
-- }

create function create_skill_project_from_ai(p_payload jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user_id          uuid := auth.uid();
  v_skill_project_id uuid;
  v_phase            jsonb;
  v_phase_id         uuid;
  v_phase_ids        uuid[] := '{}';
  v_topic            jsonb;
  v_phase_idx        integer;
  v_topic_idx        integer;
  v_project          jsonb;
  v_project_id       uuid;
  v_linked_idx       jsonb;
begin
  insert into skill_projects (user_id, name, goal, level, timeline_months)
  values (
    v_user_id,
    p_payload->>'name',
    p_payload->>'goal',
    p_payload->>'level',
    (p_payload->>'timelineMonths')::integer
  )
  returning id into v_skill_project_id;

  v_phase_idx := 0;
  for v_phase in select * from jsonb_array_elements(p_payload->'phases')
  loop
    insert into phases (skill_project_id, user_id, order_index, name, status)
    values (
      v_skill_project_id,
      v_user_id,
      v_phase_idx,
      v_phase->>'name',
      case when v_phase_idx = 0 then 'current' else 'not_started' end
    )
    returning id into v_phase_id;

    v_phase_ids := v_phase_ids || v_phase_id;

    v_topic_idx := 0;
    for v_topic in select * from jsonb_array_elements(v_phase->'topics')
    loop
      insert into topics (phase_id, user_id, order_index, label)
      values (v_phase_id, v_user_id, v_topic_idx, v_topic #>> '{}');
      v_topic_idx := v_topic_idx + 1;
    end loop;

    v_phase_idx := v_phase_idx + 1;
  end loop;

  for v_project in select * from jsonb_array_elements(coalesce(p_payload->'portfolioProjects', '[]'::jsonb))
  loop
    insert into portfolio_projects (
      skill_project_id, user_id, order_index, name, timeline, difficulty,
      description, hook, proves, stack
    )
    values (
      v_skill_project_id,
      v_user_id,
      coalesce((v_project->>'orderIndex')::integer, 0),
      v_project->>'name',
      v_project->>'timeline',
      v_project->>'difficulty',
      v_project->>'description',
      v_project->>'hook',
      v_project->>'proves',
      array(select jsonb_array_elements_text(coalesce(v_project->'stack', '[]'::jsonb)))
    )
    returning id into v_project_id;

    for v_linked_idx in select * from jsonb_array_elements(coalesce(v_project->'phaseIndices', '[]'::jsonb))
    loop
      insert into portfolio_project_phases (portfolio_project_id, phase_id)
      values (v_project_id, v_phase_ids[(v_linked_idx::text)::integer + 1]);
    end loop;
  end loop;

  return v_skill_project_id;
end;
$$;
