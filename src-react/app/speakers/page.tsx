import SpeakersPendingSection from "@/src/components/sections/SpeakersPendingSection";
import MainLayout from "../../src/components/layout/MainLayout";
import SpeakersSection from "../../src/components/sections/SpeakersSection";
import { websiteSettings } from "../../src/config/website-settings";

export const metadata = {
    title: "Speakers | Bitbash"
};

export default function SpeakersPage() {

    const announced = websiteSettings.currentEdition.speakers.announced;

    return (
        <MainLayout>
            {announced ? <SpeakersSection /> : <SpeakersPendingSection />}
        </MainLayout>
    );
}