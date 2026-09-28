import Section from "@/src/components/layout/Section";
import TicketOutcomeSummary from "@/src/components/tickets/TicketOutcomeSummary";
import { toStringList } from "@/src/utils/search-params";
import MainLayout from "../../../../../src/components/layout/MainLayout";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

interface ThankYouPageProps {
    searchParams: Promise<{ confirmed?: string | string[]; waitlisted?: string | string[]; }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
    const { confirmed, waitlisted } = await searchParams;
    const confirmedTicketNames = toStringList(confirmed);
    const waitlistedTicketNames = toStringList(waitlisted);

    return (
        <MainLayout>
            <Section headerText="Registration Received" sectionBackground={2}>
                <div className="text-light text-center">
                    <p className="lead mt-5">We&apos;ve received your registration. Check your email for confirmation.</p>

                    <TicketOutcomeSummary
                        confirmedTicketNames={confirmedTicketNames}
                        waitlistedTicketNames={waitlistedTicketNames}
                    />

                    <p className="mt-5">If you don&apos;t receive an email shortly, please check your spam folder.</p>
                </div>
            </Section>
        </MainLayout>
    );
}
