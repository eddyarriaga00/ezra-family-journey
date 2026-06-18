# Ezra — Family Journey & Care

A bilingual, mobile-first family website for celebrating Ezra’s journey and optionally recording useful care updates.

**Live site:** [eddyarriaga00.github.io/ezra-family-journey](https://eddyarriaga00.github.io/ezra-family-journey/)

> [!IMPORTANT]
> This repository is public because it is deployed with GitHub Pages on GitHub Free. The application source and bundled family photos are visible to everyone. Care updates entered through the website currently stay in that browser’s local storage and are not committed back to GitHub.

## What works now

- First-visit English/Spanish choice and persistent language switch
- Four simple destinations: Home, Growth, Care, and Moments
- Optional weight, feeding, medication, and milestone updates
- No streaks, reminders, overdue states, or pressure to log consistently
- Photo-led family moments using family-approved images of Ezra
- Responsive weight history chart
- Local browser persistence
- GitHub Pages deployment workflow
- Supabase PostgreSQL schema with row-level security

Local data is intentionally the default so the UI can be used immediately. Clearing browser storage clears local records. Supabase account sync is the next integration step after creating the free project.

Family-approved images live in `public/images/ezra`. Medical portal screenshots, billing details, account identifiers, diagnoses, and care-team information are intentionally excluded from this public repository.

## Run locally

```bash
npm install
npm run dev
```

## Connect the free Supabase backend

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in its SQL editor.
3. Copy `.env.example` to `.env` and add the project URL and public anon key.
4. Enable email authentication in Supabase. Never expose the service-role key.
5. Add the same two values as GitHub repository secrets for Pages deployment.

The schema separates families, members, babies, and care entries. Row-level security ensures signed-in users can only read records for families they belong to.

## Deploy to GitHub Pages

Push to `main`, then select **GitHub Actions** under Repository Settings → Pages → Source. The included workflow builds and publishes the `dist` directory.

## Privacy and care

This is a family organization tool, not a medical device. Do not use it to make dosing, feeding, or emergency decisions. Confirm care instructions with Ezra’s clinicians.

Because the repository and Pages website are public:

- Never commit `.env`, Supabase service-role keys, passwords, medical documents, or private contact information.
- Only add family photos that you are comfortable publishing openly on the internet.
- Remove image metadata before publishing personal photos when possible.
- Keep private care records in Supabase behind authentication and row-level security, not in source files.
- The Supabase public anon key may be used by the frontend after row-level security is configured; the service-role key must never be exposed.

## Planned next steps

1. Create the free Supabase project and apply `supabase/schema.sql`.
2. Add email authentication and family invitations.
3. Sync browser records to each authenticated family account.
4. Add an in-app photo replacement/upload workflow with private storage.
5. Test installation as an iPhone home-screen web app.
