import { websiteSettings } from "../../src/config/website-settings";
import EmailForm from "../../src/components/tickets/EmailForm";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "../../src/components/layout/Section";
import TicketRegistration from "@/src/components/tickets/TicketRegistration";

// TODO Do for other pages as well
export const metadata = {
    title: "Tickets | Bitbash"
};

export default function Tickets() {
    const ticketsOnSale = websiteSettings.conferenceTicketSaleOpened || websiteSettings.workshopTicketSaleOpened;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <MainLayout>
            <div style={{ height: '100px' }}></div> {/* Header spacer */}

            <Section id="tickets" headerText="Tickets" extraClass="rocket4">
                {ticketsOnSale ? (
                    <>
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <p className="text-center">
                                    Bitbash is a <strong>100% free</strong>, two-day conference
                                </p>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            {/* Workshops Box */}
                            <div className="col-md-5 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h4 className="card-title text-muted">{formatDate(websiteSettings.preConWorkshopsDate)}</h4>
                                        <hr />
                                        <h3 className="mb-1">Workshops</h3>
                                        <p className="mb-0">
                                            Hands-on training led by experts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Conference Box */}
                            <div className="col-md-5 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h4 className="card-title text-muted">{formatDate(websiteSettings.conferenceDate)}</h4>
                                        <hr />
                                        <h3 className="mb-1">Conference Talks</h3>
                                        <p className="mb-0">
                                            A full day packed with 50-minute talks.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <p className="text-center">
                                    You can choose to attend just the workshops, just the conference talks, or both.
                                </p>
                            </div>
                        </div>

                        <div className="row justify-content-center mb-5">
                            <div className="col-md-10">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <p className="card-title text-center">Start your registration by entering your email below</p>
                                        <hr />
                                        <EmailForm />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="container text-center">
                        <p>Ticket sales will open soon. Follow us on social media to be notified when tickets become available!</p>
                    </div>
                )}
            </Section>
        </MainLayout>
    );
}