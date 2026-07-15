-- profiles table + auth.users trigger

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null unique,
  email      text not null,
  created_at timestamptz not null default now()
);

create unique index profiles_username_lower_idx on profiles (lower(username));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
