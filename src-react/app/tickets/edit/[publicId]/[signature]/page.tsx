import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import UpdateRegistrationForm from "@/src/components/tickets/UpdateRegistrationForm";

export const metadata = {
    title: "Update Registration | Bitbash"
};

export default async function UpdateRegistrationPage({
    params
}: {
    params: Promise<{ publicId: string; signature: string }>
}) {

    const { publicId, signature } = await params;

    return (
        <MainLayout>
            <Section headerText="Update Registration" sectionBackground={2}>
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-9">
                        <UpdateRegistrationForm publicId={publicId} signature={signature} />
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}