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
            tickets: registration.ticketTypeIds,
            waitlistedTickets: registration.waitlistedTicketTypes.map(waitlisted => ({
                id: waitlisted.ticketTypeId,
                position: waitlisted.position
            })),
            offeredTickets: registration.offeredTicketTypes.map(offered => ({
                id: offered.ticketTypeId,
                expiresAt: offered.expiresAt
            }))
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

        // Mirrors the create-registration split shape: the same
        // registerable/waitlistable classification applied at create time is
        // applied here, so a single update can move ticket types between
        // confirmed and waitlisted in either direction.
        //
        // couponCode, when present, redeems a coupon against whichever
        // newly-confirmed ticket type ids it covers, bypassing the normal
        // registerable/capacity check for just those ids.
        await admittoRequest<void>(eventPath(`/registrations/${encodeURIComponent(registrationId)}`), {
            method: "PUT",
            body: {
                firstName: body.firstName,
                lastName: body.lastName,
                additionalDetails: body.additionalDetails || null,
                registerTicketTypeIds: body.ticketTypeIds || [],
                waitlistTicketTypeIds: body.waitlistTicketTypeIds || [],
                couponCode: body.couponCode || null
            }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return toProblemResponse(error);
    }
}
