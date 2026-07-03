import "server-only";

import { getAdmittoApiKey, getAdmittoSettings } from "@/src/config/admitto-settings.server";

export interface PublicTicketTypeDto {
    id: string;
    name: string;
    timeSlots: string[];
    status: "available" | "waitlist" | "soldOut";
}

export interface PartnerRegistrationDetailDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: "registered" | "cancelled";
    ticketTypeIds: string[];
    tickets: { id: string; name: string }[];
    additionalDetails: Record<string, string>;
}

export class AdmittoPartnerError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

interface AdmittoRequestOptions {
    method?: string;
    body?: unknown;
    token?: string;
}

export async function admittoRequest<T>(path: string, options: AdmittoRequestOptions = {}): Promise<T> {
    const settings = getAdmittoSettings();
    const url = new URL(path, settings.baseUrl);
    const headers: Record<string, string> = {
        "X-Api-Key": getAdmittoApiKey()
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const res = await fetch(url.toString(), {
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store"
    });

    if (!res.ok) {
        throw await createAdmittoError(res);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
        return undefined as T;
    }

    return await res.json() as T;
}

export function eventPath(path: string): string {
    const { eventSlug } = getAdmittoSettings();
    return `/api/events/${encodeURIComponent(eventSlug)}${path}`;
}

export async function createAdmittoError(res: Response): Promise<AdmittoPartnerError> {
    let errorData: unknown = null;
    try {
        errorData = await res.json();
    } catch {
        // Keep the generic message below when the upstream body is not JSON.
    }

    const problem = isRecord(errorData) ? errorData : null;
    const errors = isRecord(problem?.errors) ? problem.errors : null;
    const validationErrors = errors
        ? Object.values(errors).flat().map(String).join(", ")
        : undefined;

    return new AdmittoPartnerError(
        validationErrors || stringValue(problem?.detail) || stringValue(problem?.title) || `Admitto request failed with status ${res.status}.`,
        res.status,
        stringValue(problem?.code) || stringValue(problem?.errorCode)
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

export function toProblemResponse(error: unknown): Response {
    if (error instanceof AdmittoPartnerError) {
        return Response.json(
            { detail: error.message, code: error.code },
            { status: error.status }
        );
    }

    const message = error instanceof Error ? error.message : "Unexpected error.";
    return Response.json({ detail: message }, { status: 500 });
}
