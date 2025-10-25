'use client'

import React from "react";
import Section from "@/src/components/layout/Section";
import { useSearchParams } from "next/navigation";
import PastEditionsTabs from "./PastEditionsTabs";
import { websiteSettings } from "@/src/config/website-settings";
import PhotoViewer from "../common/PhotoViewer";
import SpeakersSection from "./SpeakersSection";
import AftermoviePlayer from "../common/AftermoviePlayer";

export default function PastEditionsSection() {

    const searchParams = useSearchParams();
    let selectedEditionSlug = searchParams.get("edition") || undefined;
    selectedEditionSlug ??= websiteSettings.pastEditions[websiteSettings.pastEditions.length - 1].slug;

    const editionData = websiteSettings.pastEditions.find(e => e.slug === selectedEditionSlug);
    if (!editionData) {
        return <div className="lead text-center text-danger">Failed to load edition.</div>;
    }
    
    return (
        <div>
            <PastEditionsTabs editions={websiteSettings.pastEditions} selectedEditionSlug={selectedEditionSlug} />
            <Section headerText={editionData.description} sectionBackground={2}>
                    
                {editionData.aftermovieYoutubeId && (
                    <div className="row justify-content-center mb-4">
                        <AftermoviePlayer youtubeId={editionData.aftermovieYoutubeId} />
                    </div>
                )}

                <div className="row justify-content-center mb-4">
                    <PhotoViewer editionSlug={selectedEditionSlug} photoCount={editionData.photoCount} />
                </div>
            </Section>
            <SpeakersSection edition={selectedEditionSlug} />
        </div>
    );
}
