# Contact Hub

Contact Hub is a private, approval-first portal for researching business contacts across multiple providers without repeating lookups or accidentally burning credits. It provides one dashboard for people and one MCP endpoint at `/mcp` for AI clients.

## What we built

- Responsive Next.js dashboard with provider health, natural-language search, normalized candidate results, source provenance, confidence scores, selection, CSV export, and per-run credit limits.
- Unified MCP endpoint with `provider_status`, `search_contacts`, and `export_contacts` tools.
- Safe routing: search first, merge duplicates, pause for approval, enrich only selected contacts, stop after a verified email, and use another provider only when necessary.
- Provider setup for RocketReach, Hunter, Apollo, Prospeo, and Tomba.
- No credentials in this repository. Live calls require server-side environment variables or approved provider OAuth connections.

The current UI uses representative candidates while live provider credentials are attached to the deployed backend. Sample rows are clearly demo data and did not come from real API calls.

## Providers and free capacity

Free allowances are not interchangeable. A search page, email reveal, phone reveal, and verification may each cost differently. Provider dashboards are authoritative because plans and promotions change.

| Provider | Role | Free capacity used for planning |
| --- | --- | --- |
| Apollo | Broad people/company search | Account-specific free credits and API limits; check Apollo |
| RocketReach | Contact reveal and enrichment | Commonly about 5 initial lookups; check RocketReach |
| Hunter | Domain search, email finding, verification | 50 recurring credits/month on the current free plan |
| Prospeo | Search/enrichment fallback | Up to 50 API requests/day on Free; successful calls consume Prospeo credits |
| Tomba | Final email/phone fallback with source evidence | Conservatively budget 25 searches/month; some current Tomba documentation advertises 50 searches and 50 verifications, so check the dashboard |

### Practical total

- **Comparable recurring email-search allowance:** at least **75/month** from Hunter (50) plus conservative Tomba capacity (25).
- **Additional capacity:** up to **50 Prospeo API requests/day**, Apollo's account-specific allocation, and remaining RocketReach lookups.
- Do not add these into one credit balance: a Prospeo request is not equivalent to a Hunter credit or RocketReach lookup.

The router stretches allowances by using Apollo for audience discovery, Hunter for verification, RocketReach for gaps, and Prospeo/Tomba as fallbacks. It stops after finding a sufficiently verified business email.

## Local development

Requires Node.js 22+ and npm.

```bash
npm ci
npm run dev
```

Production validation:

```bash
npm run build
npm start
```

## MCP

The deployment exposes a stateless JSON-RPC endpoint:

```text
POST https://your-deployment.example/mcp
```

It implements `server/discover`, `tools/list`, and `tools/call` for MCP version `2026-07-28`.

## Safety and compliance

- Use only supported APIs and MCP servers.
- Never bypass authentication, CAPTCHAs, provider limits, or opt-outs.
- Require approval before credit-consuming contact reveals.
- Keep suppression lists and honor deletion or objection requests.
- Use business contact data only with an appropriate lawful basis and follow applicable privacy and direct-marketing rules.
