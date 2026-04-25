# LeadOS mobile (Expo)

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on an iPhone for device testing

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (or use the one provided by the product owner).
2. In the SQL Editor, run the migration file:  
   [`../supabase/migrations/20250425140000_initial_schema.sql`](../supabase/migrations/20250425140000_initial_schema.sql)  
   This creates `dealers`, `users`, `leads`, `client_portals`, RLS policies, a seed **Dev Dealer**, and the `auth.users` → `public.users` trigger.
3. Authentication → Providers → enable **Email**.
4. For local testing without email confirmation: Authentication → Providers → Email → disable **Confirm email** (re-enable before production).

## Environment

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.

Restart the dev server after changing `.env`.

## Run

```bash
npm install
npm start
```

Scan the QR code with Expo Go (iOS).

## Phase 1 definition of done

- Sign up / sign in with email and password  
- `public.users` row created for the auth user (via trigger) with `dealer_id` pointing at **Dev Dealer**  
- **Leads** tab loads `leads` for `auth.uid()`; empty list shows the empty state  
- Second account cannot read another user’s leads (RLS)

### RLS smoke test (two Expo Go accounts)

1. Sign up as **User A**, confirm email if required, sign in. Leads tab should load (possibly empty) with no permission errors.  
2. In Supabase **Table Editor**, insert one `leads` row with `salesperson_id` = User A’s `users.id` and valid `dealer_id` (Dev Dealer UUID). User A should see that lead.  
3. Sign up as **User B** on another device or after signing out. User B’s Leads list must **not** show User A’s lead.  
4. Optional: in SQL Editor as service role, verify `select * from leads` returns all rows; the app only returns rows for the signed-in user.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm start`    | Expo dev server          |
| `npm run typecheck` | `tsc --noEmit`      |
