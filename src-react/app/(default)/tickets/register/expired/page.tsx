import Link from "next/link";
import Section from "@/src/components/layout/Section";
import MainLayout from "../../../../../src/components/layout/MainLayout";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

export default function TokenExpiredPage() {
  return (
    <MainLayout>
        <Section headerText="Invalid Token" sectionBackground={2}>
            <div className="text-light text-center">
                <h2>Verification Token is Invalid or Expired</h2>
                <p className="lead mt-5">Please try registering again.</p>
                <Link href="/tickets" className="btn btn-primary mt-4">Back to Registration</Link>
            </div>
        </Section>
    </MainLayout>
  );
}
