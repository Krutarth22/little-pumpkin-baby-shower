# Little Pumpkin Baby Shower — Krutarth & Raksha

Static site, no build step. Works today with browser storage (demo), upgrade to Supabase for real multi-device collection.

## Run locally
```
cd "/Users/krutarthmajithia/Documents/Default Project"
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (free, no domain needed)
1. Push this folder to GitHub, import in Vercel → you get `little-pumpkin.vercel.app`. Or drag-drop on Netlify.
2. Put that link on your invites.

## Before sending invites (3 edits in app.js)
1. `AMAZON_REGISTRY_URL` → paste real Amazon baby registry link. Also used for each gift's Buy button — replace individual gift `url`s if you have per-item links.
2. `ADMIN_PASSWORD` → change from `pumpkin2026`.
3. `SEED_GIFTS` → replace 10 placeholders with real items/titles/prices.

## Going live with real RSVPs (recommended for 60-70 guests)
Demo stores in each browser's localStorage — fine for testing, but guests on different phones won't share data.
For production (15 min):
1. Create free project at supabase.com → SQL editor → run `supabase.sql` → create public Storage bucket `photos`.
2. In `app.js`, uncomment/add fetch POSTs to your `SUPABASE_URL` with anon key for rsvps / gift_claims / guestbook, and switch renders to fetch from Supabase first with localStorage fallback.
3. Change RLS later to restrict admin reads with Supabase Auth if you want.

## Host checklist
- Admin: enter password → see counts (RSVPs / attending / adults / kids), guest list, Export CSV for caterer.
- Gifts: guest clicks Buy on Amazon → must buy via Registry page so Amazon marks it → clicks Mark as Purchased here so others see Gifted badge. Reset in admin if mistaken.
- Photos: demo uses browser only. For real sharing enable Supabase Storage.
