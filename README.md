# Stop Using Our Lands for Illegal Wars

Petition to the Board of Land and Natural Resources, State of Hawaiʻi.

## Deploy

1. Push this folder to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import an existing project
3. Connect the repo
4. Deploy

That's it. No env vars, no external accounts, no API keys.

## Architecture

```
index.html                           Petition page + form + share UI + signatories list
netlify/functions/signatories.mjs    GET/POST /api/signatories via Netlify Blobs
```

## Data flow

1. User submits form
2. All fields (name, email, phone, zip) → `POST /api/signatories` → Netlify Blobs
3. Netlify Forms gets a fire-and-forget backup copy
4. On page load → `GET /api/signatories` → returns names only (no contact info)
5. After 20+ signatures, the signatories list appears

## Exporting data

Contact info is stored in the blob but never exposed publicly. To export:

- **Netlify Forms**: Dashboard → Forms → petition-signatures → CSV export
- **Blobs**: Use the Netlify CLI: `netlify blobs:get petition signers`
