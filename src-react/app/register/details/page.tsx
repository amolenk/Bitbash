import DetailsForm from "../../../src/components/tickets/DetailsForm";
import MainLayout from "../../../src/components/layout/MainLayout";

export default function DetailsPage() {
  return (
    <MainLayout>
              <div style={{ height: '130px' }}></div> {/* Header spacer */}

      <DetailsForm />
    </MainLayout>
  );
}
