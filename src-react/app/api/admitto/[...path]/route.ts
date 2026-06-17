// Catch-all proxy that forwards Admitto API calls from the browser to the upstream
// Admitto service, adding the private X-ApiKey header that must not be exposed
// in the client bundle.

import { NextRequest } from "next/server";

const ADMITTO_BASE_URL = process.env.NEXT_PUBLIC_ADMITTO_URL || "https://admitto.sandermolenkamp.com";
const ADMITTO_API_KEY = process.env.ADMITTO_API_KEY;

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
    const upstreamUrl = new URL(`${ADMITTO_BASE_URL}/${path.join("/")}`);

    // Forward query parameters
    req.nextUrl.searchParams.forEach((value, key) => {
        upstreamUrl.searchParams.set(key, value);
    });

    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (ADMITTO_API_KEY) {
        headers["X-ApiKey"] = ADMITTO_API_KEY;
    }

    const hasBody = req.method !== "GET" && req.method !== "DELETE";
    const body = hasBody ? await req.text() : undefined;

    const upstream = await fetch(upstreamUrl.toString(), {
        method: req.method,
        headers,
        body
    });

    const responseBody = await upstream.arrayBuffer();
    return new Response(responseBody, {
        status: upstream.status,
        headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "application/json"
        }
    });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, path);
}
