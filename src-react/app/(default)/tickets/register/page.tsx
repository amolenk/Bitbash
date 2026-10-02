export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import RegisterForm from "@/src/components/tickets/RegisterForm";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string; token?: string; coupon?: string; }>
}) {

    const { email, token, coupon } = await searchParams;

    // No valid email/token pair (stale bookmark, back button, edited URL):
    // send the attendee straight back to the start of the flow, silently.
    if (!email || !token) {
        redirect("/tickets");
    }

    return (
        <MainLayout>
            <Section headerText="Registration" sectionBackground={2}>
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-9">
                        <RegisterForm email={email} token={token} initialCouponCode={coupon} />
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
