// All Admitto API calls for Bitbash registration

import { websiteSettings } from "../config/website-settings";

export class AdmittoError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }
}

export interface TicketTypeDto {
  slug: string;
  name: string;
  slotNames: string[];
  hasCapacity: boolean;
}

export interface AdditionalDetailSchemaDto {
  name: string;
  maxLength: string;
  isRequired: boolean;
}

export interface Availability {
  registrationOpensAt?: string; // ISO Date string
  registrationClosesAt?: string; // ISO Date string
  ticketTypes: TicketTypeDto[];
}

export interface RegisteredTickets {
  tickets: string[];
}

export function isRegistrationOpen(availability: Availability): boolean {

    return !isBeforeRegistrationOpen(availability) && !isAfterRegistrationClosed(availability);
}

export function isBeforeRegistrationOpen(availability: Availability): boolean {

    const now = new Date().getTime();
    const opensAt = availability?.registrationOpensAt && new Date(availability.registrationOpensAt).getTime();

    if (opensAt && now < opensAt) return true;
    return false;
}

export function isAfterRegistrationClosed(availability: Availability): boolean {

    const now = new Date().getTime();
    const closesAt = availability?.registrationClosesAt && new Date(availability.registrationClosesAt).getTime();

    if (closesAt && now > closesAt) return true;
    return false;
}

export async function requestOtp(email: string) {
    const url = `${getTicketedEventUrl()}/public/otp`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Verification request failed.");
    }
}

export async function cancel(publicId: string, signature: string) {
    const url = `${getTicketedEventUrl()}/public/${publicId}?signature=${signature}`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Cancellation failed.");
    }
}

export async function verifyOtp(email: string, code: string) {
    const url = `${getTicketedEventUrl()}/public/verify`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Verification failed.");
    }
    return (await res.json()).registrationToken;
}

export async function getAvailability(): Promise<Availability> {
    const url = `${getTicketedEventUrl()}/public/availability`;
    // Artificial delay for debugging
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await fetch(url, {
        method: "GET"
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Failed to fetch availability.");
    }
    return (await res.json());
}

export async function getTickets(publicId: string, signature: string): Promise<RegisteredTickets> {
    const url = `${getTicketedEventUrl()}/public/${publicId}/tickets?signature=${signature}`;
    // Artificial delay for debugging
    // await new Promise(resolve => setTimeout(resolve, 3000));
    const res = await fetch(url);
    if (res.status === 404) {
        return { tickets: [] };
    }
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || "Failed to fetch tickets.");
    }
    return await res.json();
}

export async function register(details: { email: string; firstName: string; lastName: string; company: string; role: string; tickets: string[]; registrationToken: string }) {
    const url = `${getTicketedEventUrl()}/public/register`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: details.email,
            firstName: details.firstName,
            lastName: details.lastName,
            additionalDetails: [
                { name: "Company", value: details.company },
                { name: "Role", value: details.role }
            ],
            requestedTickets: details.tickets,
            verificationToken: details.registrationToken
        })
    });
    if (!res.ok) {
        const errorData = await res.json();

        if (errorData?.errorCode === "validation") {

            let errorString = "";
            if (errorData && typeof errorData.errors === "object" && errorData.errors !== null) {
                errorString = Object.values(errorData.errors)
                    .flat()
                    .map(String)
                    .join(", ");
            } else {
                errorString = String(errorData.errors);
            }
            throw new AdmittoError(errorString, errorData.errorCode);
        }

        throw new AdmittoError(errorData?.detail || "Registration failed.", errorData?.errorCode);
    }
    return true;
}

// Private helper: Returns the full ticketed event string, e.g. 'teams/bitbash/events/winter-2025'
function getTicketedEventUrl() {
    const settings = require("../config/website-settings").websiteSettings.admitto;
    return `${settings.baseUrl}/teams/${settings.teamSlug}/events/${settings.eventSlug}`;
}
