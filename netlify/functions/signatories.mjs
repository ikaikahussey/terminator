// Airtable-backed signatories API
// Env vars required: AIRTABLE_TOKEN, AIRTABLE_BASE_ID
// Table: "Signatories" with fields: Name, Email, Phone, Zip (all single line text)

const BASE_URL = "https://api.airtable.com/v0";
const TABLE = "Signatories";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // GET — return all signatories
  if (req.method === "GET") {
    try {
      const signers = [];
      let offset = null;

      // Paginate through all records
      do {
        const params = new URLSearchParams({
          "fields[]": "Name",
          pageSize: "100",
        });
        if (offset) params.set("offset", offset);

        const res = await fetch(
          `${BASE_URL}/${baseId}/${encodeURIComponent(TABLE)}?${params}`,
          { headers: headers() }
        );

        if (!res.ok) {
          const err = await res.text();
          console.error("Airtable GET error:", err);
          throw new Error("Airtable fetch failed");
        }

        const data = await res.json();
        for (const rec of data.records) {
          if (rec.fields.Name) {
            signers.push({
              name: rec.fields.Name,
              ts: new Date(rec.createdTime).getTime(),
            });
          }
        }
        offset = data.offset || null;
      } while (offset);

      return Response.json(
        { signers, count: signers.length },
        { headers: { ...CORS, "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } }
      );
    } catch (e) {
      console.error(e);
      return Response.json({ signers: [], count: 0 }, { headers: CORS });
    }
  }

  // POST — add a signatory
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON" },
        { status: 400, headers: CORS }
      );
    }

    const name = (body.name || "").trim().substring(0, 100);
    if (!name) {
      return Response.json(
        { error: "Name required" },
        { status: 400, headers: CORS }
      );
    }

    const email = (body.email || "").trim().substring(0, 200);
    const phone = (body.phone || "").trim().substring(0, 30);
    const zip = (body.zip || "").trim().substring(0, 10);

    const fields = { Name: name };
    if (email) fields.Email = email;
    if (phone) fields.Phone = phone;
    if (zip) fields.Zip = zip;

    try {
      const res = await fetch(
        `${BASE_URL}/${baseId}/${encodeURIComponent(TABLE)}`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            records: [{ fields }],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("Airtable POST error:", err);
        throw new Error("Airtable write failed");
      }

      // Return updated count (fetch fresh)
      const listRes = await fetch(
        `${BASE_URL}/${baseId}/${encodeURIComponent(TABLE)}?${new URLSearchParams({
          "fields[]": "Name",
          pageSize: "100",
        })}`,
        { headers: headers() }
      );
      const listData = await listRes.json();
      const signers = listData.records
        .filter((r) => r.fields.Name)
        .map((r) => ({
          name: r.fields.Name,
          ts: new Date(r.createdTime).getTime(),
        }));

      return Response.json(
        { signers, count: signers.length },
        { headers: CORS }
      );
    } catch (e) {
      console.error(e);
      return Response.json(
        { error: "Failed to save" },
        { status: 500, headers: CORS }
      );
    }
  }

  return Response.json(
    { error: "Method not allowed" },
    { status: 405, headers: CORS }
  );
};

export const config = {
  path: "/api/signatories",
};
