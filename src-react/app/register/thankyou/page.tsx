import MainLayout from "../../../src/components/layout/MainLayout";

export default function ThankYouPage() {
  return (
    <MainLayout>
        <div style={{ height: '130px' }}></div> {/* Header spacer */}
      <div className="ticket-thankyou text-center">
        <h2>Thank you for registering!</h2>
        <p>We've received your registration. Check your email for confirmation.</p>
      </div>
    </MainLayout>
  );
}
