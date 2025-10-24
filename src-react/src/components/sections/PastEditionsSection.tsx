'use client'

import React from "react";
import Section from "@/src/components/layout/Section";
import { useSearchParams } from "next/navigation";
import PastEditionsTabs from "./PastEditionsTabs";
import { websiteSettings } from "@/src/config/website-settings";
import PhotoViewer from "../common/PhotoViewer";
import SpeakersSection from "./SpeakersSection";

interface PastEditionsSectionProps {
  edition: string;
}

export default function PastEditionsSection({ edition }: PastEditionsSectionProps) {

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
                <div className="d-flex justify-content-center container mb-4">
                    <PhotoViewer editionSlug={selectedEditionSlug} photoCount={editionData.photoCount} />
                </div>
            </Section>
            <SpeakersSection edition={selectedEditionSlug} />
        </div>
    );
}
