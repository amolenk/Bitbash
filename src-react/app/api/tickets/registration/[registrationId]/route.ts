import { admittoRequest, eventPath, PartnerRegistrationDetailDto, toProblemResponse } from "@/src/lib/admitto.server";

export async function GET(
    req: Request,
    context: { params: Promise<{ registrationId: string }> }
) {
    try {
        const { registrationId } = await context.params;

        const registration = await admittoRequest<PartnerRegistrationDetailDto>(
            eventPath(`/registrations/${encodeURIComponent(registrationId)}`)
        );

        return Response.json({
            id: registration.id,
            status: registration.status,
            firstName: registration.firstName,
            lastName: registration.lastName,
            additionalDetails: registration.additionalDetails,
            tickets: registration.ticketTypeIds
        });
    } catch (error) {
        return toProblemResponse(error);
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ registrationId: string }> }
) {
    try {
        const { registrationId } = await context.params;
        const body = await req.json();

        await admittoRequest<void>(eventPath(`/registrations/${encodeURIComponent(registrationId)}`), {
            method: "PUT",
            body: {
                firstName: body.firstName,
                lastName: body.lastName,
                additionalDetails: body.additionalDetails || null,
                ticketTypeIds: body.ticketTypeIds || []
            }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return toProblemResponse(error);
    }
}
