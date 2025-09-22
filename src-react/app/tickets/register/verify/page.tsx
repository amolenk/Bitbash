import OtpVerifyForm from "../../../../src/components/tickets/OtpVerifyForm";
import MainLayout from "../../../../src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

export default function VerifyPage() {
    return (
        <MainLayout>
            <Section headerText="Verify Email" extraClass="rocket1">
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-6">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header text-center"><h3>We've sent a verification code to your email.<br/>Please enter it below to continue your registration.</h3></div>
                            <div className="card-body center text-center">
                                <OtpVerifyForm />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
