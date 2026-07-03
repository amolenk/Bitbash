import { admittoRequest, eventPath, toProblemResponse } from "@/src/lib/admitto.server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await admittoRequest<void>(eventPath("/registrations"), {
            method: "POST",
            token: body.registrationToken,
            body: {
                email: body.email,
                firstName: body.firstName,
                lastName: body.lastName,
                registerTicketTypeIds: body.ticketTypeIds || [],
                waitlistTicketTypeIds: body.waitlistTicketTypeIds || [],
                additionalDetails: body.additionalDetails || null
            }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return toProblemResponse(error);
    }
}
