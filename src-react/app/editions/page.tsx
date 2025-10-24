import React from "react";
import MainLayout from "@/src/components/layout/MainLayout";
import PastEditionSection from "@/src/components/sections/PastEditionsSection";
import { websiteSettings } from "@/src/config/website-settings";
import SpeakersSection from "@/src/components/sections/SpeakersSection";
import Section from "@/src/components/layout/Section";
import PhotoViewer from "@/src/components/common/PhotoViewer";

export const metadata = {
    title: "Past Editions | Bitbash"
};

export default async function PastEditionsPage({
    params,
}: {
    params: Promise<{ edition: string; }>
}) {

    let { edition } = await params;
    
    return (
        <MainLayout>
            <PastEditionSection edition={edition} />
        </MainLayout>);
}
