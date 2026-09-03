# Little Pumpkin Baby Shower — Krutarth & Raksha

Static site, no build step. Live at `https://krutarth22.github.io/little-pumpkin-baby-shower/`.
Cloud backend: Supabase (shared RSVPs + keepsake wall + photo storage).

## Run locally
```
cd "/Users/krutarthmajithia/Documents/Default Project"
python3 -m http.server 8080
# open http://localhost:8080
```

## Supabase one-time setup (required before invites!)
The keys are already in `app.js`. You must create the tables + bucket once:
1. Supabase dashboard → SQL editor → New query → paste all of `supabase.sql` → Run.
2. Storage → New bucket → name `keepsake`, set **Public ON**.
3. Auth → Providers → Email → confirm magic-link/OTP login is enabled.
4. Reload the site, scroll to Host Admin, enter your email → click the login link → guest list + CSV unlock.

How security works: guests can INSERT RSVPs/keepsakes but cannot READ the RSVP list (RLS). Only your logged-in email can read/export. No passwords in source code.

## Deploy
Push to `main` on GitHub — Pages rebuilds automatically in ~1 min.
Put the live link on your invites.

## Host checklist
- Admin: email magic-link login → counts (RSVPs / attending / adults / kids), guest list, Export CSV for caterer.
- Registry: link-only to Amazon. Guests must buy via the Registry page so Amazon marks items purchased.
- Keepsake wall: notes + photos collect in Supabase; wall is public, RSVP list is private.
