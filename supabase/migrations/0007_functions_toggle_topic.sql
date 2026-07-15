-- toggle_topic_done(): flip topic, recompute phase status, unlock next phase, log activity

create function toggle_topic_done(p_topic_id uuid)
returns setof phases
language plpgsql
security invoker
as $$
declare
  v_phase_id          uuid;
  v_skill_project_id  uuid;
  v_user_id           uuid;
  v_order_index       integer;
  v_total_topics      integer;
  v_done_topics       integer;
  v_new_status        text;
  v_prev_phase_status text;
  v_next_phase_id     uuid;
  v_next_phase_status text;
begin
  update topics set done = not done
  where id = p_topic_id
  returning phase_id, user_id into v_phase_id, v_user_id;

  if v_phase_id is null then
    raise exception 'topic not found or not owned by caller';
  end if;

  select skill_project_id, order_index into v_skill_project_id, v_order_index
  from phases where id = v_phase_id;

  select count(*), count(*) filter (where done)
  into v_total_topics, v_done_topics
  from topics where phase_id = v_phase_id;

  if v_total_topics > 0 and v_done_topics = v_total_topics then
    v_new_status := 'complete';
  else
    if v_order_index = 0 then
      v_new_status := 'current';
    else
      select status into v_prev_phase_status
      from phases
      where skill_project_id = v_skill_project_id and order_index = v_order_index - 1;

      if v_prev_phase_status = 'complete' then
        v_new_status := 'current';
      else
        v_new_status := 'not_started';
      end if;
    end if;
  end if;

  update phases set status = v_new_status where id = v_phase_id;

  if v_new_status = 'complete' then
    select id, status into v_next_phase_id, v_next_phase_status
    from phases
    where skill_project_id = v_skill_project_id and order_index = v_order_index + 1;

    if v_next_phase_id is not null and v_next_phase_status <> 'complete' then
      update phases set status = 'current' where id = v_next_phase_id;
    end if;
  end if;

  insert into activity_log (user_id, skill_project_id, occurred_on, weight)
  values (v_user_id, v_skill_project_id, current_date, 1)
  on conflict (skill_project_id, occurred_on)
  do update set weight = activity_log.weight + 1;

  return query select * from phases where skill_project_id = v_skill_project_id order by order_index;
end;
$$;
