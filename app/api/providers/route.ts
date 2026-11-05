import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({providers:{apollo:!!process.env.APOLLO_API_KEY,rocketreach:!!process.env.ROCKETREACH_API_KEY,hunter:!!process.env.HUNTER_API_KEY,prospeo:!!process.env.PROSPEO_API_KEY,tomba:!!process.env.TOMBA_API_KEY&&!!process.env.TOMBA_SECRET_KEY},live:true})}
