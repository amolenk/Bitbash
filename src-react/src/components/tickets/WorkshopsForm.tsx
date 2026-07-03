'use client'

import { Availability, TicketTypeDto } from "@/src/api/admitto";
import { formatDate } from "@/src/utils/date-utils";

interface WorkshopsFormProps {
    availability: Availability | null;
    workshopsDate: string;
    workshopSelections: string[];
    setWorkshopSelections: React.Dispatch<React.SetStateAction<string[]>>;
    disabled: boolean
}

export default function WorkshopsForm({ 
    availability, workshopsDate, workshopSelections, setWorkshopSelections, disabled
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
                        {(() => {
                            // Sort: morning first, then afternoon, then full-day
                            const sorted = [...workshopTickets].sort((a: TicketTypeDto, b: TicketTypeDto) => {
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
                            return sorted.map((ticket: TicketTypeDto) => {
                                const isMorning = ticket.timeSlots.includes("morning-workshop");
                                const isAfternoon = ticket.timeSlots.includes("afternoon-workshop");
                                let badgeText = "";
                                if (isMorning && isAfternoon) badgeText = "Full-day";
                                else if (isMorning) badgeText = "Morning";
                                else if (isAfternoon) badgeText = "Afternoon";
                                return (
                                    <div key={ticket.id} className="form-check text-start mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={ticket.id}
                                            checked={workshopSelections.includes(ticket.id)}
                                            disabled={disabledTickets.has(ticket.id) || !ticket.hasCapacity || disabled}
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
                                            {ticket.hasCapacity && <span className="badge text-bg-primary text-light ms-2">{badgeText}</span>}
                                            {!ticket.hasCapacity && <span className="badge bg-danger ms-2">Sold Out</span>}
                                        </label>
                                    </div>
                                );
                            });
                        })()}
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
