export const dynamic = "force-dynamic";

import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import UpdateRegistrationForm from "@/src/components/tickets/UpdateRegistrationForm";

export const metadata = {
    title: "Update Registration | Bitbash"
};

export default async function UpdateRegistrationPage({
    params, searchParams
}: {
    params: Promise<{ registrationId: string }>,
    searchParams: Promise<{ redirect?: boolean; }>
}) {
    const { registrationId } = await params;
    const { redirect } = await searchParams;

    return (
        <MainLayout>
            <Section headerText="Update Registration" sectionBackground={2}>
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-9">

                        {redirect && <div className="alert alert-warning">We found an existing registration for this email.<br />You can update or cancel your registration below.</div>}

                        <UpdateRegistrationForm registrationId={registrationId} />
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
