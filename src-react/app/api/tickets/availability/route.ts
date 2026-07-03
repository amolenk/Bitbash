import { getAdmittoSettings } from "@/src/config/admitto-settings.server";
import { admittoRequest, eventPath, PublicTicketTypeDto, toProblemResponse } from "@/src/lib/admitto.server";
import { websiteSettings } from "@/src/config/website-settings";

export async function GET() {
    try {
        const settings = getAdmittoSettings();
        const ticketTypes = await admittoRequest<PublicTicketTypeDto[]>(eventPath("/ticket-types"));

        return Response.json({
            registrationOpensAt: websiteSettings.currentEdition.registration.opensAt.toISOString(),
            registrationClosesAt: websiteSettings.currentEdition.registration.closesAt.toISOString(),
            ticketTypes: ticketTypes
                .filter(ticketType => !settings.ignoredTicketTypeIds.includes(ticketType.id))
                .map(ticketType => ({
                    id: ticketType.id,
                    name: ticketType.name,
                    timeSlots: ticketType.timeSlots,
                    status: ticketType.status,
                    hasCapacity: ticketType.status === "available"
                }))
        });
    } catch (error) {
        return toProblemResponse(error);
    }
}
