# Clinkd Support Site

A basic GitHub Pages support website for Clinkd.

## What it does

- Public users submit a support ticket with email + message.
- Tickets are stored in Supabase.
- The admin page lets you log in, view tickets, mark tickets closed/open, and reply using your email app.

## Files

- `index.html` — public support form
- `admin.html` — private ticket dashboard
- `styles.css` — styling
- `app.js` — ticket submit logic
- `admin.js` — login/view/reply/update logic
- `config.js` — Supabase URL and public anon key
- `supabase-schema.sql` — database table and security policies

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Paste and run `supabase-schema.sql`.
4. In Supabase, go to Authentication > Users and create your admin user.
5. Go to Project Settings > API and copy:
   - Project URL
   - anon public key
6. Paste those into `config.js`.
7. Upload the files to GitHub.
8. Enable GitHub Pages.

## Admin URL

After publishing, visit:

`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/admin.html`
