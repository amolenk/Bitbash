// Thin client for the Playwright e2e suite to drive the Admitto stub
// server's test-only control endpoints before exercising the real app.

import { stubBaseURL } from "./env.mjs";

export interface StubTicketType {
    id: string;
    name: string;
    timeSlots: string[];
    status: "available" | "waitlist" | "soldOut";
}

// The stub's response to the next mutating call of the given kind:
// "success" returns 204, anything else returns an error problem-details
// body with the given status/code/detail. Shared by both the
// register-response and update-response controls, which have identical
// shapes.
export type StubMutationResponse =
    | { mode: "success" }
    | { mode: "error"; status: number; code?: string; detail?: string };

// Mirrors Admitto's self-service PartnerRegistrationDetailDto shape, as
// returned by GET /registrations/:id.
export interface StubRegistration {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: "registered" | "cancelled";
    ticketTypeIds: string[];
    tickets: { id: string; name: string }[];
    additionalDetails: Record<string, string>;
    waitlistedTickets: { ticketTypeId: string; position: number }[];
}

export const admittoStub = {
    async reset(): Promise<void> {
        await fetch(`${stubBaseURL}/__control__/reset`, { method: "POST" });
    },

    async setTicketTypes(ticketTypes: StubTicketType[]): Promise<void> {
        await fetch(`${stubBaseURL}/__control__/ticket-types`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketTypes),
        });
    },

    async setRegisterResponse(response: StubMutationResponse): Promise<void> {
        await fetch(`${stubBaseURL}/__control__/register-response`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
        });
    },

    // Returns the request body of the most recent POST /registrations call
    // received by the stub (or null if none has happened since the last
    // reset), so a test can assert on exactly what the app sent.
    async getLastRegisterRequest(): Promise<Record<string, unknown> | null> {
        const res = await fetch(`${stubBaseURL}/__control__/last-register-request`);
        return await res.json();
    },

    // Returns how many POST /registrations calls the stub has received
    // since the last reset, so a test can assert a mixed confirmed/waitlist
    // submission produced exactly one request.
    async getRegisterRequestCount(): Promise<number> {
        const res = await fetch(`${stubBaseURL}/__control__/register-request-count`);
        const body = await res.json() as { count: number };
        return body.count;
    },

    // Configures the registration returned by GET /registrations/:id for the
    // edit flow, so a test can drive the edit form for a given attendee's
    // confirmed/waitlisted ticket state without a real create-registration
    // round trip.
    async setRegistration(registration: StubRegistration | null): Promise<void> {
        await fetch(`${stubBaseURL}/__control__/registration`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registration),
        });
    },

    async setUpdateResponse(response: StubMutationResponse): Promise<void> {
        await fetch(`${stubBaseURL}/__control__/update-response`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
        });
    },

    // Returns the request body of the most recent PUT /registrations/:id
    // call received by the stub (or null if none has happened since the
    // last reset), so a test can assert on exactly what the app sent (e.g.
    // the confirmed vs. waitlist ticket-type-id split).
    async getLastUpdateRequest(): Promise<Record<string, unknown> | null> {
        const res = await fetch(`${stubBaseURL}/__control__/last-update-request`);
        return await res.json();
    },

    // Returns how many PUT /registrations/:id calls the stub has received
    // since the last reset.
    async getUpdateRequestCount(): Promise<number> {
        const res = await fetch(`${stubBaseURL}/__control__/update-request-count`);
        const body = await res.json() as { count: number };
        return body.count;
    },
};

export const defaultConferenceTicketType: StubTicketType = {
    id: "conference-ticket",
    name: "Conference",
    timeSlots: [],
    status: "available",
};
