import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "../../src/components/layout/Section";

export default function Speakers() {
  return (
    <MainLayout>
      <div style={{ height: '130px' }}></div> {/* Header spacer */}
      
      <Section headerText="Speakers" extraClass="rocket3">
        {websiteSettings.speakersAnnounced ? (
          <div className="container">
            <div className="row justify-content-center p-2">
              <p>Speaker details will be displayed here when announced.</p>
              {/* TODO: Implement speaker cards grid */}
            </div>
          </div>
        ) : (
          <div className="container text-center">
            <p>Speakers will be announced soon. Keep an eye on our social media for updates!</p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}