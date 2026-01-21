import { reconfirm } from "@/src/api/admitto";
import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

export const metadata = {
    title: "Attendance Confirmation | Bitbash"
};

export default async function ReconfirmPage({ params }: { params: { publicId: string; signature: string } }) {

    const { publicId, signature } = params;

    let success = false;
    let errorMessage = "";

    try {
        await reconfirm(publicId, signature);
        success = true;
    } catch (err: any) {
        errorMessage = err.message || "Reconfirmation failed. Please try again.";
    }

    return (
        <MainLayout>
            <Section headerText="Attendance Confirmation" sectionBackground={2}>
                {success ? (
                <div className="text-light text-center">
                    <h2>Your attendance has been successfully reconfirmed!</h2>
                    <p className="lead mt-5">Thank you for confirming your attendance. We look forward to seeing you at Bitbash!</p>
                </div>
                ) : (
                <div className="text-light text-center">
                    <h2 className="text-danger">Reconfirmation Failed</h2>
                    <p className="lead mt-5">{errorMessage}</p>
                </div>
                )}
            </Section>
        </MainLayout>
    );
}