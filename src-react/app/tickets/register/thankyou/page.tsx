import Section from "@/src/components/layout/Section";
import MainLayout from "../../../../src/components/layout/MainLayout";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

export default function ThankYouPage() {
  return (
    <MainLayout>
        <Section headerText="Registration Complete" sectionBackground={2}>
            <div className="text-light text-center">
                <h2>Thank you for registering!</h2>
                <p className="lead mt-5">We've received your registration. Check your email for confirmation.</p>
            </div>
        </Section>
    </MainLayout>
  );
}
