'use client'

import React from "react";
import SpeakerBioSection from "@/src/components/sections/SpeakerBioSection";
import SpeakerSessionsSection from "@/src/components/sections/SpeakerSessionsSection";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { websiteSettings } from "@/src/config/website-settings";
import MainLayout from "@/src/components/layout/MainLayout";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SpeakerDetailPage() {
    const params = useParams();
    const edition = params?.edition || websiteSettings.currentEdition;
    const speakerId = params?.speakerId;
    const { data, error } = useSWR(`/data/${edition}.json`, fetcher);

    if (error) return <div>Failed to load speaker.</div>;
    if (!data) return null;

    const speaker = data.Speakers.find((s: any) => s.Id === speakerId);
    if (!speaker) return <div>Speaker not found.</div>;

    return (
        <MainLayout>
            <SpeakerBioSection
                fullName={speaker.FullName}
                tagLine={speaker.TagLine}
                profilePictureUrl={speaker.ProfilePictureUrl}
                bio={speaker.Bio}
            />
            <SpeakerSessionsSection
                sessions={speaker.sessions}
                allSessions={data.Sessions || []}
            />
        </MainLayout>
    );
}
