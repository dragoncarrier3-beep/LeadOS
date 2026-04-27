-- Exposes a minimal, safe existence check for login UX.
-- Supabase Auth returns "Invalid login credentials" for both unknown email and wrong password.
-- This function allows the client to differentiate without exposing any other user data.

create or replace function public.user_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists(
    select 1
    from auth.users u
    where lower(u.email) = lower(p_email)
  );
$$;

revoke all on function public.user_exists(text) from public;
grant execute on function public.user_exists(text) to anon, authenticated;

