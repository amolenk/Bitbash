import React from "react";
import SpeakerBioSection from "@/src/components/sections/SpeakerBioSection";
import SpeakerSessionsSection from "@/src/components/sections/SpeakerSessionsSection";
import { websiteSettings } from "@/src/config/website-settings";
import MainLayout from "@/src/components/layout/MainLayout";

export const metadata = {
    title: "Speaker Details | Bitbash"
};

export default async function SpeakerDetailPage({
    params,
}: {
    params: Promise<{ edition: string; speakerId: string; }>
}) {

    let { edition, speakerId } = await params;
    edition = edition ?? websiteSettings.currentEdition.slug;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/${edition}.json`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        const speaker = data.Speakers.find((s: any) => s.Id === speakerId);
        if (!speaker) return <div>Speaker not found.</div>;

        return (
            <MainLayout>
                <SpeakerBioSection
                    fullName={speaker.FullName}
                    tagLine={speaker.TagLine}
                    profilePictureUrl={speaker.ProfilePictureUrl}
                    bio={speaker.Bio}
                    edition={edition}
                />
                <SpeakerSessionsSection
                    sessions={speaker.sessions}
                    allSessions={data.Sessions || []}
                    edition={edition}
                />
            </MainLayout>
        );
    } catch (error) {
        return <div>Failed to load speaker.</div>;
    }
}
