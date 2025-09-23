import EmailForm from "@/src/components/tickets/EmailForm";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

import { formatDate } from "@/src/utils/date-utils";
import { websiteSettings } from "../../src/config/website-settings";
import { getAvailability } from "@/src/api/admitto";
import ErrorCard from "@/src/components/common/ErrorCard";

export const metadata = {
    title: "Tickets | Bitbash"
};

export default async function TicketsPage() {

    const edition = websiteSettings.currentEdition;

    // Registration closed
    if (!edition.registration.isOpen()) {
        return (
            <MainLayout>
                <Section headerText="Tickets" sectionBackground={2}>
                    <div className="row lead text-light text-center">
                        <p>Ticket registration is currently closed.</p>
                        <p>Follow us on social media to be notified when tickets become available!</p>
                    </div>
                </Section>
            </MainLayout>
        )
    }

    // Completely sold out
    try {
        const availability = await getAvailability();
        if (availability.ticketTypes.every(t => t.hasCapacity === false)) {
            return (
                <MainLayout>
                    <Section headerText="Tickets" sectionBackground={2}>
                        <div className="row lead text-light text-center">
                            <p>All tickets are sold out.</p>
                            <p>Follow us on social media to be notified when tickets become available!</p>
                        </div>
                    </Section>
                </MainLayout>
            )
        }
    } catch (err: any) {
        return (
            <MainLayout>
                <ErrorCard error={'An error occurred while checking ticket availability.'} />
            </MainLayout>
        )
    }

    // Registration open
    return (
        <MainLayout>
            <Section headerText="Tickets" sectionBackground={2}>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <p className="lead text-center text-light">
                            Bitbash is a <strong>100% free</strong>, two-day conference
                        </p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    {/* Workshops Box */}
                    <div className="col-md-5 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header text-center text-muted pb-0"><h4>{formatDate(edition.workshopsDate)}</h4></div>
                            <div className="card-body text-center">
                                <h3 className="mb-1">Workshops</h3>
                                <p className="mb-0">
                                    Half- and full-day training led by experts.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Conference Box */}
                    <div className="col-md-5 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header text-center text-muted pb-0"><h4>{formatDate(edition.conferenceDate)}</h4></div>
                            <div className="card-body text-center">
                                <h3 className="mb-1">Conference Talks</h3>
                                <p className="mb-0">
                                    A day packed with 50-minute break-out sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <p className="lead text-center text-light">
                            You can choose to attend just the workshops, the main conference, or both.
                        </p>
                    </div>
                </div>

                <div className="row justify-content-center mb-5">
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header text-center"><h3>Enter your email below to get started</h3></div>
                            <div className="card-body">
                                <EmailForm />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}