import MainLayout from "@/src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";
import RegisterForm from "@/src/components/tickets/RegisterForm";

export const metadata = {
    title: "Ticket Registration | Bitbash"
};

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: { email: string; token: string; }
}) {

    const email = searchParams.email ?? "";
    const token = searchParams.token ?? "";

//    const { email, token } = await searchParams;

    return (
        <MainLayout>
            <Section headerText="Registration" sectionBackground={2}>
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-9">
                        <RegisterForm email={email} token={token} />
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
