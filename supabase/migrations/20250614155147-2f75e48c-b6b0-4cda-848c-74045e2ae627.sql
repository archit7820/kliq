
-- 1. Create storage bucket for avatars (public so images are viewable)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- 2. Add a unique constraint on username in profiles
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_name='profiles'
    and constraint_type='UNIQUE'
    and constraint_name='profiles_username_key'
  ) then
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  end if;
end
$$;

