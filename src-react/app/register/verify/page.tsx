import OtpVerifyForm from "../../../src/components/tickets/OtpVerifyForm";
import MainLayout from "../../../src/components/layout/MainLayout";

export default function VerifyPage() {
  return (
    <MainLayout>
        <div style={{ height: '130px' }}></div> {/* Header spacer */}

      <OtpVerifyForm />
    </MainLayout>
  );
}
