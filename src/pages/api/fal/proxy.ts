import { NextRequest, NextResponse } from 'next/server';
import { route } from "@fal-ai/serverless-proxy/nextjs";

export const config = {
    runtime: 'edge',
};

export const POST = (req: NextRequest) => { 
  return route.POST(req);
};

export const GET = route.GET;

// Default export function
export default function handler(req: NextRequest) {
  switch (req.method) {
    case 'GET':
      return GET(req);
    case 'POST':
      return POST(req);
    default:
      // Optionally handle other methods or return a 405 Method Not Allowed response
      return new NextResponse('Method Not Allowed', { status: 405 });
  }
}