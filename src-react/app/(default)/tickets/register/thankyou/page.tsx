import Section from "@/src/components/layout/Section";
import MainLayout from "../../../../../src/components/layout/MainLayout";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

// URL query params only ever appear as a single string or, when the same
// key was appended more than once, as a string array. Normalize both shapes
// to a plain array so the itemized lists below can render uniformly.
function toList(value?: string | string[]): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

interface ThankYouPageProps {
    searchParams: Promise<{ confirmed?: string | string[]; waitlisted?: string | string[]; }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
    const { confirmed, waitlisted } = await searchParams;
    const confirmedTicketNames = toList(confirmed);
    const waitlistedTicketNames = toList(waitlisted);

    return (
        <MainLayout>
            <Section headerText="Registration Received" sectionBackground={2}>
                <div className="text-light text-center">
                    <p className="lead mt-5">We&apos;ve received your registration. Check your email for confirmation.</p>

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

                    <p className="mt-5">If you don&apos;t receive an email shortly, please check your spam folder.</p>
                </div>
            </Section>
        </MainLayout>
    );
}
