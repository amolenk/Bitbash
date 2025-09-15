import OtpVerifyForm from "../../../src/components/tickets/OtpVerifyForm";
import MainLayout from "../../../src/components/layout/MainLayout";
import EmailForm from "@/src/components/tickets/EmailForm";
import Section from "@/src/components/layout/Section";

export default function VerifyPage() {
    return (
        <MainLayout>
            <div style={{ height: '100px' }}></div> {/* Header spacer */}

            <Section headerText="Verify Email" extraClass="rocket1">
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-6">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center">
                                <div>
                                    <p>We've sent a verification code to your email.<br/>Please enter it below to continue your registration.</p>
                                </div>
                                <hr />
                                <div className="center">
                                    <OtpVerifyForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </MainLayout>
    );
}
