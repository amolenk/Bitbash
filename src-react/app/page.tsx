import { websiteSettings } from "../src/config/website-settings";
import MainLayout from "../src/components/layout/MainLayout";
import Hero from "../src/components/sections/Hero";
import About from "../src/components/sections/About";
import SpeakerHighlights from "../src/components/sections/SpeakerHighlights";
import Venue from "../src/components/sections/Venue";
import Organizers from "../src/components/sections/Organizers";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <About />
      {websiteSettings.currentEdition.speakers.announced && <SpeakerHighlights />}
      <Venue />
      <Organizers />
    </MainLayout>
  );
}
