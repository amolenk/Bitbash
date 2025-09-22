'use client'

import { Availability, TicketTypeDto } from "@/src/api/admitto";
import { formatDate } from "@/src/utils/date-utils";
import { websiteSettings } from "@/src/config/website-settings";

interface WorkshopsFormProps {
    availability: Availability | null;
    workshopSelections: string[];
    setWorkshopSelections: React.Dispatch<React.SetStateAction<string[]>>;
    disabled: boolean
}

export default function WorkshopsForm({ 
    availability, workshopSelections, setWorkshopSelections, disabled
}: WorkshopsFormProps) {

    const edition = websiteSettings.currentEdition;

    const getDisabledTickets = () => {
        const slotsTaken = new Set<string>();
        const selected = availability?.ticketTypes.filter(t => workshopSelections.includes(t.slug));

        selected?.forEach(ticket => {
            ticket.slotNames.forEach(slot => slotsTaken.add(slot));
        });

        return new Set(
            availability?.ticketTypes
                .filter(t => !workshopSelections.includes(t.slug))
                .filter(t => t.slotNames.some(slot => slotsTaken.has(slot)))
                .map(t => t.slug)
        );
    };

    const disabledTickets = getDisabledTickets();

    return (
        <div className="card h-100 shadow-sm mb-4">
            <div className="card-header text-center"><h3>Pre-conference Workshops – {formatDate(edition.workshopsDate)}</h3></div>
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
                        {(() => {
                            const workshopTickets = availability.ticketTypes
                                .filter((t: TicketTypeDto) => t.slotNames.includes("morning-workshop") || t.slotNames.includes("afternoon-workshop"));
                            if (!workshopTickets) return null;
                            // Sort: morning first, then afternoon, then full-day
                            const sorted = [...workshopTickets].sort((a: TicketTypeDto, b: TicketTypeDto) => {
                                const aMorning = a.slotNames.includes("morning-workshop");
                                const aAfternoon = a.slotNames.includes("afternoon-workshop");
                                const bMorning = b.slotNames.includes("morning-workshop");
                                const bAfternoon = b.slotNames.includes("afternoon-workshop");
                                // Full-day: both morning and afternoon
                                const aFullDay = aMorning && aAfternoon;
                                const bFullDay = bMorning && bAfternoon;
                                if (aFullDay && !bFullDay) return -1;
                                if (!aFullDay && bFullDay) return 1;
                                if (aMorning && !aAfternoon && bAfternoon && !bMorning) return -1;
                                if (bMorning && !bAfternoon && aAfternoon && !aMorning) return 1;
                                return 0;
                            });
                            return sorted.map((ticket: TicketTypeDto) => {
                                const isMorning = ticket.slotNames.includes("morning-workshop");
                                const isAfternoon = ticket.slotNames.includes("afternoon-workshop");
                                let badgeText = "";
                                if (isMorning && isAfternoon) badgeText = "Full-day";
                                else if (isMorning) badgeText = "Morning";
                                else if (isAfternoon) badgeText = "Afternoon";
                                return (
                                    <div key={ticket.slug} className="form-check text-start mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={ticket.slug}
                                            checked={workshopSelections.includes(ticket.slug)}
                                            disabled={disabledTickets.has(ticket.slug) || !ticket.hasCapacity || disabled}
                                            onChange={() => {
                                                setWorkshopSelections((tickets: string[]) =>
                                                    tickets.includes(ticket.slug)
                                                        ? tickets.filter((s: string) => s !== ticket.slug)
                                                        : [...tickets, ticket.slug]
                                                );
                                            }}
                                        />
                                        <label className="form-check-label ms-2" htmlFor={ticket.slug}>
                                            {ticket.name}
                                            {" "}
                                            {ticket.hasCapacity && <span className="badge text-bg-primary text-light ms-2">{badgeText}</span>}
                                            {!ticket.hasCapacity && <span className="badge bg-danger ms-2">Sold Out</span>}
                                        </label>
                                    </div>
                                );
                            });
                        })()}
                        {availability.ticketTypes.filter((t: TicketTypeDto) =>
                            t.slotNames.includes("morning-workshop") || t.slotNames.includes("afternoon-workshop")
                        ).length === 0 && (
                                <div className="text-muted">No workshops available at this time.</div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}