// app/api/env-check/route.ts

export async function GET() {
    return Response.json({
        hasAdmittoApiKey: Boolean(process.env.ADMITTO_API_KEY),
        hasAdmittoUrl: Boolean(process.env.ADMITTO_URL),
        hasEventSlug: Boolean(process.env.ADMITTO_EVENT_SLUG),
    });
}