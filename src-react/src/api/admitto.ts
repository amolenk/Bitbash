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

// A ticket type the registration's email currently holds an active waitlist
// entry for (as opposed to a confirmed ticket), with that entry's current
// position in the per-ticket-type waitlist queue.
export interface WaitlistedTicket {
    id: string;
    position: number;
}

export interface RegistrationDetail {
    id: string;
    status: "registered" | "cancelled";
    firstName: string;
    lastName: string;
    additionalDetails: Record<string, string>;
    tickets: string[];
    waitlistedTickets: WaitlistedTicket[];
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

// Classifies a selected ticket-type-id list for an update-registration
// submission. Unlike a fresh create-registration submission, an edit can
// resubmit ticket types the attendee already holds: those keep whatever
// classification they already had (confirmed stays confirmed, waitlisted
// stays waitlisted) even if the ticket type's public status has since
// shifted, so simply re-saving the form (or changing an unrelated field)
// never silently demotes or promotes an untouched selection. Only ticket
// types newly added to the selection — the ones actually being switched —
// are classified by their current status, mirroring create's
// classification.
export function classifyTicketSelectionsForUpdate(
    availability: Availability | null,
    selectedTicketTypeIds: string[],
    originallyConfirmedTicketTypeIds: string[],
    originallyWaitlistedTicketTypeIds: string[]
): { registerTicketTypeIds: string[]; waitlistTicketTypeIds: string[] } {
    const newTicketTypeIds = selectedTicketTypeIds.filter(id =>
        !originallyConfirmedTicketTypeIds.includes(id) && !originallyWaitlistedTicketTypeIds.includes(id)
    );
    const { registerTicketTypeIds: newlyRegisteredIds, waitlistTicketTypeIds: newlyWaitlistedIds } =
        splitTicketSelectionsByStatus(availability, newTicketTypeIds);

    return {
        registerTicketTypeIds: [
            ...selectedTicketTypeIds.filter(id => originallyConfirmedTicketTypeIds.includes(id)),
            ...newlyRegisteredIds
        ],
        waitlistTicketTypeIds: [
            ...selectedTicketTypeIds.filter(id => originallyWaitlistedTicketTypeIds.includes(id)),
            ...newlyWaitlistedIds
        ]
    };
}

// Resolves a list of ticket-type ids to their display names as of the last
// fetched availability, dropping any id that no longer matches a known
// ticket type. Shared by both the create and update confirmation flows so
// their itemized confirmed/waitlisted lists are built identically.
export function ticketTypeNames(availability: Availability | null, ticketTypeIds: string[]): string[] {
    return ticketTypeIds
        .map(id => availability?.ticketTypes.find(t => t.id === id)?.name)
        .filter((name): name is string => !!name);
}

// Builds the confirmed/waitlisted URL query params for a submission
// outcome, resolving ticket-type ids to display names as of the last
// fetched availability. Shared by the create and update forms so the
// confirmation page's itemized lists are built identically from either.
export function ticketOutcomeSearchParams(
    availability: Availability | null,
    registerTicketTypeIds: string[],
    waitlistTicketTypeIds: string[]
): URLSearchParams {
    const params = new URLSearchParams();
    ticketTypeNames(availability, registerTicketTypeIds).forEach(name => params.append("confirmed", name));
    ticketTypeNames(availability, waitlistTicketTypeIds).forEach(name => params.append("waitlisted", name));
    return params;
}

// Availability shifted between page load and submit: the backend rejected
// the request because a ticket type's status no longer matches what was
// classified client-side. Refetch fresh availability, clear the
// conference/workshop selections back to unselected (personal details are
// left untouched), and ask the attendee to review and reselect. Shared by
// both the create and update forms so a stale ticket-state conflict is
// recovered from identically on either.
export async function recoverFromTicketStateConflict(handlers: {
    setConferenceSelection: (value: boolean | null) => void;
    setWorkshopSelections: (value: string[]) => void;
    setAvailability: (value: Availability) => void;
    setSubmittingError: (value: string) => void;
    setLoadingError: (value: string) => void;
    setSubmitting: (value: boolean) => void;
}): Promise<void> {
    handlers.setConferenceSelection(null);
    handlers.setWorkshopSelections([]);

    try {
        handlers.setAvailability(await getAvailability());
        handlers.setSubmittingError("Ticket availability changed while you were completing this form. Please review and reselect your tickets, then submit again.");
    } catch {
        // The stale availability we already have is now known to be wrong,
        // and a retry would be classified against that same stale data —
        // so surface this as a distinct, more serious failure rather than
        // silently inviting another reselect.
        handlers.setLoadingError("Could not refresh ticket availability after your selection changed. Please reload the page and try again.");
    } finally {
        handlers.setSubmitting(false);
    }
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
    ticketTypeIds: string[],
    waitlistTicketTypeIds: string[]) {

    await request<void>(`/api/tickets/registration/${encodeURIComponent(registrationId)}`, {
        method: "PUT",
        body: JSON.stringify({
            firstName,
            lastName,
            ticketTypeIds,
            waitlistTicketTypeIds,
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
