# Ezra

A bilingual family website for celebrating Ezra’s journey and saving occasional care updates.

## Development

```bash
npm install
npm run dev
```

Built with React, TypeScript, Vite, and Supabase-ready database support.

Family photos are intentionally included in the public site. Credentials stay
outside the repository in local environment files or GitHub Actions secrets;
all `.env*` files except `.env.example` are ignored by Git.

## PostgreSQL / Supabase setup

1. Create a Supabase project and apply
   `supabase/migrations/20260618173000_initial_schema.sql` with the Supabase CLI
   (`supabase link` followed by `supabase db push`) or its SQL editor.
2. Copy `.env.example` to `.env.local` and add the project URL and public anon key.
3. For GitHub Pages, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as
   repository Actions secrets. Never use the `service_role` key in this app.

The gallery remains public. Signing in is required only to create, synchronize,
or delete care updates. PostgreSQL row-level security isolates each family.

## Quality checks

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Unit tests cover local-date handling, password recovery, and failed database
write rollback. Playwright smoke tests cover desktop/mobile rendering, scrolling,
public photos, navigation, and the authentication dialog. GitHub Actions runs
all checks before deploying Pages.
