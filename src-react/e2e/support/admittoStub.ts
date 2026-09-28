// Thin client for the Playwright e2e suite to drive the Admitto stub
// server's test-only control endpoints before exercising the real app.

import { stubBaseURL } from "./env.mjs";

export interface StubTicketType {
    id: string;
    name: string;
    timeSlots: string[];
    status: "available" | "waitlist" | "soldOut";
}

export type StubRegisterResponse =
    | { mode: "success" }
    | { mode: "error"; status: number; code?: string; detail?: string };

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

    async setRegisterResponse(response: StubRegisterResponse): Promise<void> {
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
};

export const defaultConferenceTicketType: StubTicketType = {
    id: "conference-ticket",
    name: "Conference",
    timeSlots: [],
    status: "available",
};
