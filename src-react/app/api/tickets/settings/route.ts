import { getAdmittoSettings } from "@/src/config/admitto-settings.server";
import { admittoRequest, eventPath, PublicTicketTypeDto, toProblemResponse } from "@/src/lib/admitto.server";
import { websiteSettings } from "@/src/config/website-settings";

export async function GET() {
    try {
        const settings = getAdmittoSettings();
        const edition = websiteSettings.currentEdition;

        if (!settings.mainConferenceTicketTypeName) {
            throw new Error("ADMITTO_MAIN_CONFERENCE_TICKET_TYPE_NAME is not configured.");
        }

        const ticketTypes = await admittoRequest<PublicTicketTypeDto[]>(eventPath("/ticket-types"));
        const mainConferenceTicketType = ticketTypes.find(ticketType => ticketType.name === settings.mainConferenceTicketTypeName);

        if (!mainConferenceTicketType) {
            throw new Error(`Main conference ticket type "${settings.mainConferenceTicketTypeName}" was not found.`);
        }

        return Response.json({
            mainConferenceTicketTypeId: mainConferenceTicketType.id,
            workshopsDate: edition.workshopsDate.toISOString(),
            conferenceDate: edition.conferenceDate.toISOString(),
            registrationOpen: edition.registration.isOpen()
        });
    } catch (error) {
        return toProblemResponse(error);
    }
}
