# Deploy DATAAPHA AI on Render

Skip GitHub details here — connect whatever repo you push later.

## Option A — Dashboard (manual)

1. Render → **New** → **Static Site**
2. Connect your repo (when ready)
3. Settings:

| Field | Value |
|--------|--------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. **Environment** → add:

```
VITE_SUPABASE_URL=https://jcyrwpzhpkubrgreuhxr.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

5. Deploy
6. If `/admin` 404s on refresh, add **Rewrite**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite  

   (Also covered by `public/_redirects` after build.)

## Option B — Blueprint (`render.yaml`)

1. Push this project (including `render.yaml`) to your repo
2. Render → **New** → **Blueprint**
3. Select the repo
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when prompted
5. Deploy

## After deploy — test

- Form: `https://YOUR-SITE.onrender.com/`
- Admin: `https://YOUR-SITE.onrender.com/admin`
  - Username: `admin`
  - Password: `Admin@123`

Share the form URL with testers. Their data appears in `/admin` via Supabase.

## Important

- Vite embeds env vars **at build time**. If you change env vars on Render, trigger a **redeploy**.
- Never commit `.env` (it is gitignored).
