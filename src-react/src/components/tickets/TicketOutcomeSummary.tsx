// Shared itemized confirmed/waitlisted ticket-name lists, rendered
// identically on both the create-registration and update-registration
// confirmation pages so the "confirmed vs waitlisted" outcome is always
// communicated the same way.

interface TicketOutcomeSummaryProps {
    confirmedTicketNames: string[];
    waitlistedTicketNames: string[];
}

export default function TicketOutcomeSummary({ confirmedTicketNames, waitlistedTicketNames }: TicketOutcomeSummaryProps) {
    return (
        <>
            {confirmedTicketNames.length > 0 && (
                <div className="mt-5" data-testid="confirmed-tickets">
                    <h3>Confirmed</h3>
                    <ul className="list-unstyled">
                        {confirmedTicketNames.map(name => <li key={name}>{name}</li>)}
                    </ul>
                </div>
            )}

            {waitlistedTicketNames.length > 0 && (
                <div className="mt-4" data-testid="waitlisted-tickets">
                    <h3>Waitlisted</h3>
                    <p className="text-muted">
                        You&apos;ve been added to the waitlist for the item(s) below. If a spot opens up, we&apos;ll email you.
                    </p>
                    <ul className="list-unstyled">
                        {waitlistedTicketNames.map(name => <li key={name}>{name}</li>)}
                    </ul>
                </div>
            )}
        </>
    );
}
