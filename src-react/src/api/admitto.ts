// Browser-facing Bitbash ticket API calls. These call local Next.js routes;
// the routes call Admitto server-side and add private API credentials.

export class AdmittoError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }
}

export interface TicketTypeDto {
    id: string;
    name: string;
    timeSlots: string[];
    status: "available" | "waitlist" | "soldOut";
    hasCapacity: boolean;
}

export interface Availability {
    registrationOpensAt?: string;
    registrationClosesAt?: string;
    ticketTypes: TicketTypeDto[];
}

export interface RegistrationDetail {
    id: string;
    status: "registered" | "cancelled";
    firstName: string;
    lastName: string;
    additionalDetails: Record<string, string>;
    tickets: string[];
}

export interface VerificationResult {
    registrationToken: string;
    registrationId?: string;
    email: string;
}

export interface TicketSettings {
    mainConferenceTicketTypeId: string;
    workshopsDate: string;
    conferenceDate: string;
    registrationOpen: boolean;
}

// Pure client-side classification of a selected ticket-type-id list, based
// on each ticket type's status as last fetched. The backend remains the
// source of truth and will reject (with a conflict) any request whose
// classification no longer matches reality by the time it's processed.
export function splitTicketSelectionsByStatus(
    availability: Availability | null,
    selectedTicketTypeIds: string[]
): { registerTicketTypeIds: string[]; waitlistTicketTypeIds: string[] } {
    const registerTicketTypeIds: string[] = [];
    const waitlistTicketTypeIds: string[] = [];

    selectedTicketTypeIds.forEach(ticketTypeId => {
        const ticketType = availability?.ticketTypes.find(t => t.id === ticketTypeId);
        if (ticketType?.status === "waitlist") {
            waitlistTicketTypeIds.push(ticketTypeId);
        } else {
            registerTicketTypeIds.push(ticketTypeId);
        }
    });

    return { registerTicketTypeIds, waitlistTicketTypeIds };
}

export function isRegistrationOpen(availability: Availability): boolean {
    return !isBeforeRegistrationOpen(availability) && !isAfterRegistrationClosed(availability);
}

export function isBeforeRegistrationOpen(availability: Availability): boolean {
    const now = new Date().getTime();
    const opensAt = availability?.registrationOpensAt && new Date(availability.registrationOpensAt).getTime();

    return !!opensAt && now < opensAt;
}

export function isAfterRegistrationClosed(availability: Availability): boolean {
    const now = new Date().getTime();
    const closesAt = availability?.registrationClosesAt && new Date(availability.registrationClosesAt).getTime();

    return !!closesAt && now > closesAt;
}

export async function getTicketSettings(): Promise<TicketSettings> {
    return await request<TicketSettings>("/api/tickets/settings");
}

export async function requestOtp(email: string) {
    await request<void>("/api/tickets/otp/request", {
        method: "POST",
        body: JSON.stringify({ email })
    });
}

export async function cancel(registrationId: string) {
    await request<void>(`/api/tickets/registration/${encodeURIComponent(registrationId)}/cancel`, {
        method: "POST"
    });
}

export async function reconfirm(registrationId: string) {
    await resendTicketEmail(registrationId);
}

export async function resendTicketEmail(registrationId: string) {
    await request<void>(`/api/tickets/registration/${encodeURIComponent(registrationId)}/ticket-email/resend`, {
        method: "POST"
    });
}

export async function verifyOtp(email: string, code: string) {
    return await request<VerificationResult>("/api/tickets/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code })
    });
}

export async function getAvailability(): Promise<Availability> {
    return await request<Availability>("/api/tickets/availability");
}

export async function getRegistration(registrationId: string): Promise<RegistrationDetail> {
    return await request<RegistrationDetail>(`/api/tickets/registration/${encodeURIComponent(registrationId)}`);
}

export async function register(
    email: string,
    firstName: string,
    lastName: string,
    attendeeType: string,
    organization: string,
    role: string,
    graduationDate: string,
    ticketTypeIds: string[],
    waitlistTicketTypeIds: string[],
    registrationToken: string) {

    await request<void>("/api/tickets/register", {
        method: "POST",
        body: JSON.stringify({
            email,
            firstName,
            lastName,
            ticketTypeIds,
            waitlistTicketTypeIds,
            registrationToken,
            additionalDetails: {
                "attendee-type": attendeeType,
                organization,
                role,
                "graduation-date": graduationDate
            }
        })
    });

    return true;
}

export async function updateRegistration(
    registrationId: string,
    firstName: string,
    lastName: string,
    attendeeType: string,
    organization: string,
    role: string,
    graduationDate: string,
    ticketTypeIds: string[]) {

    await request<void>(`/api/tickets/registration/${encodeURIComponent(registrationId)}`, {
        method: "PUT",
        body: JSON.stringify({
            firstName,
            lastName,
            ticketTypeIds,
            additionalDetails: {
                "attendee-type": attendeeType,
                organization,
                role,
                "graduation-date": graduationDate
            }
        })
    });

    return true;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers
        }
    });

    if (!res.ok) {
        throw await createError(res);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return await res.json() as T;
}

async function createError(res: Response): Promise<AdmittoError> {
    let errorData: unknown = null;
    try {
        errorData = await res.json();
    } catch {
        // Use the generic message below when the response body is not JSON.
    }

    const problem = typeof errorData === "object" && errorData !== null
        ? errorData as Record<string, unknown>
        : null;

    return new AdmittoError(
        stringValue(problem?.detail) || stringValue(problem?.title) || `The ticketing request failed (HTTP ${res.status}).`,
        stringValue(problem?.code) || stringValue(problem?.errorCode)
    );
}

function stringValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}
