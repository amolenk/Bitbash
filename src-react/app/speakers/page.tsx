import MainLayout from "../../src/components/layout/MainLayout";
import SpeakersSection from "../../src/components/sections/SpeakersSection";

export default function Speakers() {
  return (
    <MainLayout>
      <div style={{ height: '130px' }}></div> {/* Header spacer */}
      <SpeakersSection />
    </MainLayout>
  );
}