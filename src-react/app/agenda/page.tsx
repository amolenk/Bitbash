import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "../../src/components/layout/Section";
import AgendaSection from "@/src/components/sections/AgendaSection";

export default function Agenda() {
  return (
    <MainLayout>
      <div style={{ height: '130px' }}></div> {/* Header spacer */}
      
      <AgendaSection />
    </MainLayout>
  );
}