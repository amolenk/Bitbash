export const dynamic = "force-dynamic";

import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import CancelForm from "@/src/components/tickets/CancelForm";

export const metadata = {
    title: "Ticket Cancellation | Bitbash"
};

export default async function CancelPage({ params }: { params: Promise<{ registrationId: string }> }) {

    const { registrationId } = await params;
    return (
        <MainLayout>
            <Section headerText="Ticket Cancellation" sectionBackground={2}>
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-6">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header text-center"><h3>Confirm Cancellation</h3></div>
                            <div className="card-body center text-center">
                                <CancelForm registrationId={registrationId} />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
