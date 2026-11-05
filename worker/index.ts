import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
const tools=[
 {name:"provider_status",description:"Show configured contact providers and whether each is ready.",inputSchema:{type:"object",properties:{},additionalProperties:false}},
 {name:"search_contacts",description:"Plan a unified business-contact search without spending reveal credits.",inputSchema:{type:"object",properties:{query:{type:"string"},limit:{type:"integer",minimum:1,maximum:100},max_credits:{type:"integer",minimum:0,maximum:1000}},required:["query"],additionalProperties:false}},
 {name:"export_contacts",description:"Create a normalized CSV payload from reviewed contacts.",inputSchema:{type:"object",properties:{contacts:{type:"array",items:{type:"object"}}},required:["contacts"],additionalProperties:false}}
];
const reply=(id:unknown,result:unknown)=>Response.json({jsonrpc:"2.0",id,result});
async function handleMcp(request:Request){const body=await request.json() as {id?:unknown;method?:string;params?:{name?:string;arguments?:Record<string,unknown>}};if(body.method==="server/discover")return reply(body.id,{supportedVersions:["2026-07-28"],capabilities:{tools:{}}});if(body.method==="tools/list")return reply(body.id,{tools});if(body.method==="tools/call"){const name=body.params?.name;if(name==="provider_status")return reply(body.id,{content:[{type:"text",text:JSON.stringify({rocketreach:"connected",hunter:"connected",apollo:"connected",prospeo:"needs hosted secret",tomba:"needs hosted secret",mode:"safe"})}]});if(name==="search_contacts")return reply(body.id,{content:[{type:"text",text:JSON.stringify({status:"planned",query:body.params?.arguments?.query,providers:["Apollo","RocketReach","Hunter"],reveal_credits_used:0,message:"Search plan created. Hosted provider secrets are required for live aggregation."})}]});if(name==="export_contacts"){const contacts=Array.isArray(body.params?.arguments?.contacts)?body.params?.arguments?.contacts:[];return reply(body.id,{content:[{type:"text",text:JSON.stringify({status:"ready",rows:contacts.length,format:"csv"})}]})}return reply(body.id,{content:[{type:"text",text:`Unknown tool: ${name}`}],isError:true})}return Response.json({jsonrpc:"2.0",id:body.id,error:{code:-32601,message:"Method not found"}},{status:404})}

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    if(new URL(request.url).pathname==="/mcp"&&request.method==="POST")return handleMcp(request);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};

export default worker;
