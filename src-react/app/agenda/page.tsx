import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "../../src/components/layout/Section";

export default function Agenda() {
  return (
    <MainLayout>
      <div style={{ height: '130px' }}></div> {/* Header spacer */}
      
      <Section headerText="Agenda" extraClass="rocket2">
        {websiteSettings.agendaAnnounced ? (
          <div className="container">
            <p>Agenda details will be displayed here when available.</p>
            {/* TODO: Implement full agenda with tabs and session listings */}
          </div>
        ) : (
          <div className="container text-center">
            <p>The agenda will be announced soon. Stay tuned!</p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}