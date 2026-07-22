# Deploy DATAAPHA AI on Render

## If you already have a Node Web Service (your current setup)

In **Settings**, set:

| Field | Value |
|--------|--------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

`npm start` runs `node server.js`, which serves `dist/` with correct **CSS/JS MIME types** (fixes unstyled UI).

Then:
1. Push this latest code to GitHub
2. Render → **Manual Deploy** → **Clear build cache & deploy**

Environment variables (required):

```
VITE_SUPABASE_URL=https://jcyrwpzhpkubrgreuhxr.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

After changing env vars, redeploy (Vite embeds them at **build** time).

---

## Option — Static Site (also fine)

| Field | Value |
|--------|--------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

No Start Command needed. SPA rewrite: `/*` → `/index.html`.

---

## After deploy — test

- Form: `https://YOUR-SITE.onrender.com/`
- Admin: `https://YOUR-SITE.onrender.com/admin`
  - Username: `admin`
  - Password: `Admin@123`

Styles should load (green theme, cards). If CSS still fails, hard-refresh (Ctrl+Shift+R).
