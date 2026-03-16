# Stop Using Our Lands for Illegal Wars

Petition to the Board of Land and Natural Resources, State of Hawaiʻi.

## Deploy to Netlify

### Option 1: Git deploy (recommended)
1. Push this folder to a GitHub/GitLab repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
3. Connect the repo — Netlify will auto-detect the config
4. Deploy

### Option 2: CLI deploy
```bash
npm install -g netlify-cli
cd petition-site
npm install
netlify deploy --prod
```

## Architecture

- **index.html** — Single-page petition with form, share UI, and signatories list
- **netlify/functions/signatories.mjs** — Serverless function (Netlify Functions v2) that stores and serves signatory names via Netlify Blobs
- **Netlify Forms** — Captures full submission data (name, email, phone, zip) in the Netlify dashboard, accessible via CSV export
- **Netlify Blobs** — Stores the public signatory names list server-side, visible to all visitors

## Data flow

1. User submits the form
2. Form data (including private fields) → Netlify Forms (dashboard only)
3. Public name only → `POST /api/signatories` → Netlify Blobs
4. On page load → `GET /api/signatories` → renders names for all visitors
5. After 20+ signatures, the signatories list becomes visible

## Managing data

- **View submissions**: Netlify dashboard → Forms → "petition-signatures"
- **Export**: CSV export available from the Forms dashboard
- **Signatory names**: Stored in Netlify Blobs store "petition-signatories" key "signers"
