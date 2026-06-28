# VocabLens production setup

The repository is production-ready, but cloud credentials must be supplied by the project owner.

## 1. Verify the repository

```powershell
npm install
npm run check
```

For a local end-to-end API check, keep `npm run dev` running in one terminal and run:

```powershell
npm run test:smoke
npm run test:extension
```

## 2. Create and migrate Supabase

Create a Supabase project, then run from the repository root:

```powershell
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push --dry-run
npx supabase@latest db push
```

The tracked migration creates all tables, indexes, constraints and row-level security policies. Do not edit the production schema manually after linking; create new migration files instead.

## 3. Configure Google OAuth

In Google Cloud, create a Web OAuth client and use this authorized redirect URI:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Enable Google in Supabase Authentication Providers using that client ID and secret.

After the web domain is known, configure Supabase Authentication URL Configuration:

```text
Site URL: https://YOUR_WEB_DOMAIN

Redirect URLs:
https://YOUR_WEB_DOMAIN/auth/callback
http://localhost:3000/auth/callback
https://hgiddlpbigolofgkdpjbomekihbajogp.chromiumapp.org/auth
```

`hgiddlpbigolofgkdpjbomekihbajogp` is the stable ID of the unpacked extension in this repository. Replace it with the Chrome Web Store ID after publishing.

## 4. Deploy the web app

Import the repository into Vercel and set the project root to `apps/web`.

```text
Install command: cd ../.. && npm install
Build command: cd ../.. && npm run build -w @vocablens/web
```

Set these production environment variables:

```text
NEXT_PUBLIC_APP_URL=https://YOUR_WEB_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3-flash
```

Never expose `SUPABASE_SECRET_KEY` in the extension or any `NEXT_PUBLIC_`/`VITE_` variable.

## 5. Build the production extension

Copy `apps/extension/.env.production.example` to `apps/extension/.env.production` and fill in the real values:

```text
VITE_API_BASE_URL=https://YOUR_WEB_DOMAIN
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Then run:

```powershell
npm run build:production -w @vocablens/extension
npm run validate -w @vocablens/extension
```

The build automatically adds the web and Supabase origins to `host_permissions`. Load `apps/extension/dist` as an unpacked extension and click its toolbar icon to verify API and login status.

## 6. Production acceptance check

1. Sign in on `/login` and confirm the callback returns to `/dashboard`.
2. Click the extension icon and confirm it reports the production API URL.
3. Select one English word on an HTTPS page.
4. Confirm definition, Vietnamese translation and context appear.
5. Save the word and confirm it appears in `/words` with the original URL.
6. Complete one flashcard and quiz question; verify rows appear in `review_events`, `quiz_sessions` and `quiz_answers`.

