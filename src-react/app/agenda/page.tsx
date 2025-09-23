import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import AgendaSection from "@/src/components/sections/AgendaSection";
import AgendaPendingSection from "@/src/components/sections/AgendaPendingSection";
import { Suspense } from "react";

export const metadata = {
    title: "Agenda | Bitbash"
};

export default function AgendaPage() {

    const announced = websiteSettings.currentEdition.schedule.announced;

    return (
        <MainLayout>
            <Suspense fallback={<div>Loading agenda...</div>}>
            {announced ? <AgendaSection /> : <AgendaPendingSection />}
            </Suspense>
        </MainLayout>
    );
}