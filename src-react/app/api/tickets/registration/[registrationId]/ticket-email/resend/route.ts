import { admittoRequest, eventPath, toProblemResponse } from "@/src/lib/admitto.server";

export async function POST(
    _req: Request,
    context: { params: Promise<{ registrationId: string }> }
) {
    try {
        const { registrationId } = await context.params;
        await admittoRequest<void>(eventPath(`/registrations/${encodeURIComponent(registrationId)}/ticket-email/resend`), {
            method: "POST"
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return toProblemResponse(error);
    }
}
