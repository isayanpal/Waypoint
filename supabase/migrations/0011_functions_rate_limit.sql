-- check_and_log_ai_generation(): rolling 24h rate-limit gate, count-then-insert as one
-- statement to keep the race window negligible. security definer since it's called
-- before the caller necessarily has a session-scoped RLS context we want to rely on
-- for the log write, and it only ever touches the passed-in p_user_id.

create function check_and_log_ai_generation(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent_count integer;
begin
  select count(*) into v_recent_count
  from ai_generations
  where user_id = p_user_id
    and created_at > now() - interval '24 hours';

  if v_recent_count >= 2 then
    return false;
  end if;

  insert into ai_generations (user_id) values (p_user_id);
  return true;
end;
$$;
