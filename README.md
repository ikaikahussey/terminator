# Stop Using Our Lands for Illegal Wars

Petition to the Board of Land and Natural Resources, State of Hawaiʻi.

## Setup

### 1. Create the Airtable base

1. Go to [airtable.com](https://airtable.com) and create a new base (or use an existing one)
2. Create a table called **Signatories** with these fields:
   - **Name** — Single line text (default first field)
   - **Email** — Email
   - **Phone** — Phone number
   - **Zip** — Single line text
3. That's it. Airtable tracks creation time automatically.

### 2. Get your Airtable credentials

1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Create a Personal Access Token with these scopes:
   - `data.records:read`
   - `data.records:write`
3. Grant it access to the base you created
4. Copy the token
5. Get your Base ID from the URL: `https://airtable.com/appXXXXXXXXXX/...` — the `appXXXXXXXXXX` part

### 3. Deploy to Netlify

#### Option A: Git deploy (recommended)
1. Push this folder to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
3. Connect the repo
4. In **Site settings → Environment variables**, add:
   - `AIRTABLE_TOKEN` = your personal access token
   - `AIRTABLE_BASE_ID` = your base ID (starts with `app`)
5. Deploy

#### Option B: CLI deploy
```bash
npm install -g netlify-cli
cd petition-site
netlify deploy --prod
```
Then set env vars in the Netlify dashboard.

## Architecture

```
index.html                           Single-page petition + form + share UI + signatories list
netlify/functions/signatories.mjs    Serverless function: GET/POST /api/signatories
Netlify Forms                        Captures full submission data (name, email, phone, zip)
Airtable                             Stores public signatory names, visible to all visitors
```

## Data flow

1. User submits the form
2. Full form data (name, email, phone, zip) → **Netlify Forms** (private, dashboard only)
3. All fields (name, email, phone, zip) → `POST /api/signatories` → **Airtable**
4. On page load → `GET /api/signatories` → fetches **names only** from Airtable → renders for all visitors
5. After 20+ signatures, the signatories list becomes visible

Contact info (email, phone, zip) is stored in Airtable but never returned by the GET endpoint or displayed publicly.

## Managing data

- **All submissions**: Airtable base → Signatories table — view, sort, filter, export names + email + phone + zip
- **Backup**: Netlify dashboard → Forms → "petition-signatures" → CSV export (also has all fields)
- **Remove a name**: Delete the row in Airtable; it disappears from the public list on next page load
- **Public display**: Only the Name field is ever returned to the browser; contact info stays server-side

## Capacity

Airtable free tier allows 1,000 API calls/month. If you expect high volume, upgrade to Airtable Team ($20/seat/mo, 100K calls/mo) or add caching to the GET endpoint.

To add caching, add this header to the GET response in `signatories.mjs`:
```js
"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
```
This caches the response at Netlify's CDN for 30 seconds, reducing Airtable API calls.

