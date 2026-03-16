import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("petition-signatories");
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // GET — return all signatories
  if (req.method === "GET") {
    try {
      const data = await store.get("signers", { type: "json" });
      const signers = data || [];
      return Response.json({ signers, count: signers.length }, { headers });
    } catch {
      return Response.json({ signers: [], count: 0 }, { headers });
    }
  }

  // POST — add a signatory
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
    }

    const name = (body.name || "").trim().substring(0, 100);
    if (!name) {
      return Response.json({ error: "Name required" }, { status: 400, headers });
    }

    let signers = [];
    try {
      const data = await store.get("signers", { type: "json" });
      signers = data || [];
    } catch {
      signers = [];
    }

    signers.push({ name, ts: Date.now() });
    await store.setJSON("signers", signers);

    return Response.json({ signers, count: signers.length }, { headers });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers });
};

export const config = {
  path: "/api/signatories",
};
