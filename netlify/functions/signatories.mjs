import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("petition");
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // GET — return names only
  if (req.method === "GET") {
    try {
      const data = await store.get("signers", { type: "json" });
      const signers = (data || []).map((s) => ({ name: s.name, ts: s.ts }));
      return Response.json(
        { signers, count: signers.length },
        { headers: CORS }
      );
    } catch {
      return Response.json({ signers: [], count: 0 }, { headers: CORS });
    }
  }

  // POST — add a signatory
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
    }

    const name = (body.name || "").trim().substring(0, 100);
    if (!name) {
      return Response.json({ error: "Name required" }, { status: 400, headers: CORS });
    }

    let signers = [];
    try {
      const data = await store.get("signers", { type: "json" });
      signers = data || [];
    } catch {
      signers = [];
    }

    signers.push({
      name,
      email: (body.email || "").trim().substring(0, 200),
      phone: (body.phone || "").trim().substring(0, 30),
      zip: (body.zip || "").trim().substring(0, 10),
      ts: Date.now(),
    });

    await store.setJSON("signers", signers);

    const publicSigners = signers.map((s) => ({ name: s.name, ts: s.ts }));
    return Response.json({ signers: publicSigners, count: publicSigners.length }, { headers: CORS });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
};

export const config = {
  path: "/api/signatories",
};
