import Section from "@/src/components/layout/Section";
import TicketOutcomeSummary from "@/src/components/tickets/TicketOutcomeSummary";
import { toStringList } from "@/src/utils/search-params";
import MainLayout from "../../../../../src/components/layout/MainLayout";

export const metadata = {
    title: "Registration Updated | Bitbash"
};

export default async function UpdatedPage({
    searchParams
}: {
    searchParams: Promise<{ ticketsChanged?: string; confirmed?: string | string[]; waitlisted?: string | string[]; }>
}) {
    const { ticketsChanged, confirmed, waitlisted } = await searchParams;
    const ticketEmailSent = ticketsChanged === "true";
    const confirmedTicketNames = toStringList(confirmed);
    const waitlistedTicketNames = toStringList(waitlisted);

    return (
        <MainLayout>
            <Section headerText="Registration Updated" sectionBackground={2}>
                <div className="text-light text-center">
                    <h2>Your registration has been updated!</h2>
                    {ticketEmailSent ? (
                        <>
                            <p className="lead mt-5">Because your tickets changed, we&apos;ve sent you a new ticket email.</p>
                            <p className="mt-5">If you don&apos;t receive an email shortly, please check your spam folder.</p>
                        </>
                    ) : (
                        <p className="lead mt-5">Your registration details have been saved.</p>
                    )}

                    <TicketOutcomeSummary
                        confirmedTicketNames={confirmedTicketNames}
                        waitlistedTicketNames={waitlistedTicketNames}
                    />
                </div>
            </Section>
        </MainLayout>
    );
}
