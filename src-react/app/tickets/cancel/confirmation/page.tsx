import Section from "@/src/components/layout/Section";
import MainLayout from "@/src/components/layout/MainLayout";

export default function CancellationConfirmationPage() {
  return (
    <MainLayout>
        <Section headerText="Registration Cancelled" sectionBackground={2}>
            <div className="text-light text-center">
                <h2>We're sorry to see you go!</h2>
                <p className="lead mt-5">Your registration has been successfully cancelled.</p>
            </div>
        </Section>
    </MainLayout>
  );
}
