import "server-only";

export interface AdmittoSettings {
    baseUrl: string;
    eventSlug: string;
    mainConferenceTicketTypeName: string;
    ignoredTicketTypeIds: string[];
}

export function getAdmittoSettings(): AdmittoSettings {
    return {
        baseUrl: process.env.ADMITTO_URL || "https://api.admitto.org",
        eventSlug: process.env.ADMITTO_EVENT_SLUG || "bitbash-yyyy",
        mainConferenceTicketTypeName: (process.env.ADMITTO_MAIN_CONFERENCE_TICKET_TYPE_NAME || "Conference").trim(),
        ignoredTicketTypeIds: (process.env.ADMITTO_IGNORED_TICKET_TYPE_IDS || "")
            .split(",")
            .map(id => id.trim())
            .filter(Boolean)
    };
}

export function getAdmittoApiKey(): string {
    const apiKey = process.env.ADMITTO_API_KEY;
    if (!apiKey) {
        throw new Error("ADMITTO_API_KEY is not configured.");
    }

    return apiKey;
}
