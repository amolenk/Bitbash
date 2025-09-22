import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import AgendaSection from "@/src/components/sections/AgendaSection";
import AgendaPendingSection from "@/src/components/sections/AgendaPendingSection";

export default function Agenda() {

    const announced = websiteSettings.currentEdition.schedule.announced;

    return (
        <MainLayout>
            {announced ? <AgendaSection /> : <AgendaPendingSection />}
        </MainLayout>
    );
}