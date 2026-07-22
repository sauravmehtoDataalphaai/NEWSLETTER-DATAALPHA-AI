# DATAALPHA AI — Supabase setup

## 1. Create a Supabase project
1. Go to https://supabase.com and create a free project
2. Open **Project Settings → API**
3. Copy **Project URL** and **anon public** key

## 2. Create the table
1. Open **SQL Editor** in Supabase
2. Paste and run the SQL in `supabase/schema.sql`

## 3. Add env vars locally
1. Copy `.env.example` to `.env`
2. Paste your URL and anon key:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. Restart the app: `npm run dev`

## 4. Deploy on Render
See **`RENDER_DEPLOY.md`** for full steps.

Quick version:
1. New **Static Site** on Render
2. Build: `npm install && npm run build`
3. Publish directory: `dist`
4. Env vars: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
5. Redeploy after changing env vars (Vite bakes them in at build time)

Or use the included `render.yaml` Blueprint.

## Admin login
- URL: `/admin`
- Username: `admin`
- Password: `Admin@123`

After 3–5 users subscribe from different devices, open `/admin` — you will see everyone’s data from Supabase.
