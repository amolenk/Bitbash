'use client'

import { TicketTypeDto } from "@/src/api/admitto";
import { websiteSettings } from "@/src/config/website-settings";

interface RegistrationSummaryProps {
    ticketTypes: TicketTypeDto[];
    ticketSelections: string[];
}

function getTicketOrder(slug: string, ticketTypes: TicketTypeDto[]): number {
    const ticket = ticketTypes.find(t => t.slug === slug);

    // Map slotNames to order index
    if (ticket?.slotNames.includes("morning-workshop") && ticket?.slotNames.includes("afternoon-workshop")) {
        return 3; // Full day
    }
    if (ticket?.slotNames.includes("morning-workshop")) {
        return 1; // Morning
    }
    if (ticket?.slotNames.includes("afternoon-workshop")) {
        return 2; // Afternoon
    }
    return 4;
}

export default function RegistrationSummary({ ticketTypes, ticketSelections }: RegistrationSummaryProps) {

    // Sort ticketSelections according to ticketOrder
    const sortedSelections = [...ticketSelections].sort((a, b) => {
        return getTicketOrder(a, ticketTypes) - getTicketOrder(b, ticketTypes);
    });

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
    }

    return (
        <div className="mt-4">
            {sortedSelections.length > 0 ? (<>
                <h4 className="mb-3">You are registering for:</h4>
                <ul className="list-group list-group-flush mb-2">
                    {sortedSelections.map(slug => {
                        const ticket = ticketTypes.find(t => t.slug === slug);
                        if (!ticket) return null;
                        // Determine if workshop or conference
                        let dateText = "";
                        console.log(ticket.slotNames);
                        if (ticket.slotNames.includes("morning-workshop") || ticket.slotNames.includes("afternoon-workshop")) {
                            dateText = ` ${formatDate(websiteSettings.preConWorkshopsDate)}`;
                        } else if (ticket.slotNames.includes("default")) {
                            dateText = ` ${formatDate(websiteSettings.conferenceDate)}`;
                        }
                        return (
                            <li key={slug} className="list-group-item">
                                <span>{ticket.name}</span><br/>{dateText}
                            </li>
                        );
                    })}
                </ul>
            </>) : (
                <div className="text-muted">No tickets selected yet.</div>
            )}
        </div>
    );
}