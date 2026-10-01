'use client'

import { Availability, TicketTypeDto } from "@/src/api/admitto";
import { formatDate } from "@/src/utils/date-utils";
import { WAITLIST_EXPLANATION } from "./waitlistCopy";

interface WorkshopsFormProps {
    availability: Availability | null;
    workshopsDate: string;
    workshopSelections: string[];
    setWorkshopSelections: React.Dispatch<React.SetStateAction<string[]>>;
    disabled: boolean;
    // Only set on the edit form: current queue position, per ticket-type id,
    // for any workshop the attendee currently holds an active waitlist
    // entry for (rather than a confirmed ticket).
    queuePositions?: Record<string, number>;
}

// Sort within a group: full-day tickets first, then morning, then afternoon.
function sortWorkshopTickets(tickets: TicketTypeDto[]): TicketTypeDto[] {
    return [...tickets].sort((a: TicketTypeDto, b: TicketTypeDto) => {
        const aMorning = a.timeSlots.includes("morning-workshop");
        const aAfternoon = a.timeSlots.includes("afternoon-workshop");
        const bMorning = b.timeSlots.includes("morning-workshop");
        const bAfternoon = b.timeSlots.includes("afternoon-workshop");
        // Full-day: both morning and afternoon
        const aFullDay = aMorning && aAfternoon;
        const bFullDay = bMorning && bAfternoon;
        if (aFullDay && !bFullDay) return -1;
        if (!aFullDay && bFullDay) return 1;
        if (aMorning && !aAfternoon && bAfternoon && !bMorning) return -1;
        if (bMorning && !bAfternoon && aAfternoon && !aMorning) return 1;
        return 0;
    });
}

function timeSlotBadgeText(ticket: TicketTypeDto): string {
    const isMorning = ticket.timeSlots.includes("morning-workshop");
    const isAfternoon = ticket.timeSlots.includes("afternoon-workshop");
    if (isMorning && isAfternoon) return "Full-day";
    if (isMorning) return "Morning";
    if (isAfternoon) return "Afternoon";
    return "";
}

export default function WorkshopsForm({
    availability, workshopsDate, workshopSelections, setWorkshopSelections, disabled, queuePositions
}: WorkshopsFormProps) {

    const workshopTickets = availability?.ticketTypes.filter((t: TicketTypeDto) =>
        t.timeSlots.includes("morning-workshop") || t.timeSlots.includes("afternoon-workshop")
    ) ?? [];

    const getDisabledTickets = () => {
        const slotsTaken = new Set<string>();
        const selected = availability?.ticketTypes.filter(t => workshopSelections.includes(t.id));

        selected?.forEach(ticket => {
            ticket.timeSlots.forEach(slot => slotsTaken.add(slot));
        });

        return new Set(
            availability?.ticketTypes
                .filter(t => !workshopSelections.includes(t.id))
                .filter(t => t.timeSlots.some(slot => slotsTaken.has(slot)))
                .map(t => t.id)
        );
    };

    const disabledTickets = getDisabledTickets();

    const availableTickets = sortWorkshopTickets(workshopTickets.filter(t => t.status === "available"));
    const waitlistTickets = sortWorkshopTickets(workshopTickets.filter(t => t.status === "waitlist"));
    const soldOutTickets = sortWorkshopTickets(workshopTickets.filter(t => t.status === "soldOut"));

    const renderTicket = (ticket: TicketTypeDto) => {
        const isSoldOut = ticket.status === "soldOut";
        const isWaitlist = ticket.status === "waitlist";
        const queuePosition = queuePositions?.[ticket.id];
        const isSelected = workshopSelections.includes(ticket.id);

        // A ticket type the attendee already holds (confirmed or
        // waitlisted) can go fully sold out — no longer even accepting
        // waitlist joins — by the time they revisit their registration.
        // It must stay checkable-off even then, so an attendee can still
        // give it up in favor of a different, currently available or
        // waitlisted, overlapping-timeslot selection; only an unselected
        // sold-out ticket is blocked from being newly picked.
        const isDisabled = (isSoldOut && !isSelected) || disabledTickets.has(ticket.id) || disabled;

        return (
            <div key={ticket.id} className="form-check text-start mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={ticket.id}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => {
                        setWorkshopSelections((tickets: string[]) =>
                            tickets.includes(ticket.id)
                                ? tickets.filter((s: string) => s !== ticket.id)
                                : [...tickets, ticket.id]
                        );
                    }}
                />
                <label className="form-check-label ms-2" htmlFor={ticket.id}>
                    {ticket.name}
                    {" "}
                    {!isSoldOut && <span className="badge text-bg-primary text-light ms-2">{timeSlotBadgeText(ticket)}</span>}
                    {isWaitlist && <span className="badge bg-warning text-dark ms-2">Waitlist Open</span>}
                    {isSoldOut && <span className="badge bg-danger ms-2">Sold Out</span>}
                </label>
                {queuePosition !== undefined && (
                    <div className="text-info small ms-4" data-testid={`workshop-queue-position-${ticket.id}`}>
                        Your current queue position: #{queuePosition}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="card h-100 shadow-sm mb-4">
            <div className="card-header text-center"><h3>Pre-conference Workshops – {formatDate(new Date(workshopsDate))}</h3></div>
            <div className="card-body mx-5">
                <p>Interested in joining a workshop on <strong>Friday</strong>?</p>
                <p>
                    You can select one or more workshops, but please note that overlapping time slots are not allowed.
                    See our <a href="/agenda" target="_blank" rel="noopener noreferrer">agenda</a> for details on the available workshops.
                </p>
                {!availability ? (
                    <div className="text-center my-4">
                        <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {availableTickets.length > 0 && (
                            <div className="mb-4">
                                <h5>Workshops</h5>
                                {availableTickets.map(renderTicket)}
                            </div>
                        )}

                        {waitlistTickets.length > 0 && (
                            <div className="mb-4">
                                <h5>Workshop Waitlist</h5>
                                <p className="text-muted">{WAITLIST_EXPLANATION}</p>
                                {waitlistTickets.map(renderTicket)}
                            </div>
                        )}

                        {soldOutTickets.length > 0 && (
                            <div className="mb-4">
                                <h5>Sold Out</h5>
                                {soldOutTickets.map(renderTicket)}
                            </div>
                        )}

                        {workshopTickets.length === 0 && (
                            <div className="alert alert-info text-start" role="status">
                                Workshop tickets are not available yet. You can complete your registration now and update it once workshops become available.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
