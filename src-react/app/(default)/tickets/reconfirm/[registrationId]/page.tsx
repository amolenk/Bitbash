export const dynamic = "force-dynamic";

import { admittoRequest, eventPath } from "@/src/lib/admitto.server";
import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

export const metadata = {
    title: "Attendance Confirmation | Bitbash"
};

export default async function ReconfirmPage({ params }: { params: Promise<{ registrationId: string }> }) {

    const { registrationId } = await params;

    let success = false;
    let errorMessage = "";

    try {
        await admittoRequest<void>(eventPath(`/registrations/${encodeURIComponent(registrationId)}/ticket-email/resend`), {
            method: "POST"
        });
        success = true;
    } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : "Reconfirmation failed. Please try again.";
    }

    return (
        <MainLayout>
            <Section headerText="Attendance Confirmation" sectionBackground={2}>
                {success ? (
                <div className="text-light text-center">
                    <h2>Your ticket email has been resent.</h2>
                    <p className="lead mt-5">Please check your inbox for your Bitbash ticket.</p>
                </div>
                ) : (
                <div className="text-light text-center">
                    <h2 className="text-danger">Request Failed</h2>
                    <p className="lead mt-5">{errorMessage}</p>
                </div>
                )}
            </Section>
        </MainLayout>
    );
}
