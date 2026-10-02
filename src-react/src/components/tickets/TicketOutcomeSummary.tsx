// Shared confirmed/waitlisted ticket cards for both registration confirmation
// flows, so outcomes have the same layout and visual hierarchy.

interface TicketOutcomeSummaryProps {
    confirmedTicketNames: string[];
    waitlistedTicketNames: string[];
}

export default function TicketOutcomeSummary({ confirmedTicketNames, waitlistedTicketNames }: TicketOutcomeSummaryProps) {
    return (
        <>
            {confirmedTicketNames.length > 0 && (
                <div className="row justify-content-center mt-5">
                    <div className="col-md-8">
                        <div className="card h-100 shadow-sm" data-testid="confirmed-tickets">
                            <div className="card-header text-center text-muted pb-0"><h2 className="h3">Confirmed</h2></div>
                            <div className="card-body text-center">
                                <ul className="list-unstyled mb-0">
                                    {confirmedTicketNames.map(name => <li key={name} className="fs-5 fw-semibold">{name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {waitlistedTicketNames.length > 0 && (
                <div className="row justify-content-center mt-4">
                    <div className="col-md-8">
                        <div className="card h-100 shadow-sm" data-testid="waitlisted-tickets">
                            <div className="card-header text-center text-muted pb-0"><h2 className="h3">Waitlisted</h2></div>
                            <div className="card-body text-center">
                                <p>You&apos;ve been added to the waitlist for the item(s) below. If a spot opens up, we&apos;ll email you.</p>
                                <ul className="list-unstyled mb-0">
                                    {waitlistedTicketNames.map(name => <li key={name} className="fs-5 fw-semibold">{name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
