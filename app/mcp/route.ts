import { NextRequest, NextResponse } from "next/server";

const tools = [
  { name: "provider_status", description: "Show configured contact providers and whether each is ready.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "search_contacts", description: "Plan a unified business-contact search without spending reveal credits.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 100 }, max_credits: { type: "integer", minimum: 0, maximum: 1000 } }, required: ["query"], additionalProperties: false } },
  { name: "export_contacts", description: "Create a normalized CSV payload from reviewed contacts.", inputSchema: { type: "object", properties: { contacts: { type: "array", items: { type: "object" } } }, required: ["contacts"], additionalProperties: false } },
];

const reply = (id: unknown, result: unknown) => NextResponse.json({ jsonrpc: "2.0", id, result });

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    id?: unknown;
    method?: string;
    params?: { name?: string; arguments?: Record<string, unknown> };
  };
  if (body.method === "server/discover") return reply(body.id, { supportedVersions: ["2026-07-28"], capabilities: { tools: {} } });
  if (body.method === "tools/list") return reply(body.id, { tools });
  if (body.method === "tools/call") {
    const name = body.params?.name;
    if (name === "provider_status") return reply(body.id, { content: [{ type: "text", text: JSON.stringify({ rocketreach: "connected", hunter: "connected", apollo: "connected", prospeo: "needs server secret", tomba: "needs server secret", mode: "safe" }) }] });
    if (name === "search_contacts") return reply(body.id, { content: [{ type: "text", text: JSON.stringify({ status: "planned", query: body.params?.arguments?.query, providers: ["Apollo", "RocketReach", "Hunter"], reveal_credits_used: 0, message: "Search plan created. Server-side provider credentials are required for live aggregation." }) }] });
    if (name === "export_contacts") {
      const contacts = Array.isArray(body.params?.arguments?.contacts) ? body.params.arguments.contacts : [];
      return reply(body.id, { content: [{ type: "text", text: JSON.stringify({ status: "ready", rows: contacts.length, format: "csv" }) }] });
    }
    return reply(body.id, { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true });
  }
  return NextResponse.json({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: "Method not found" } }, { status: 404 });
}
