import React from "react";
import Section from "@/src/components/layout/Section";
import SessionDetailSection from "@/src/components/sections/SessionDetailSection";
import { websiteSettings } from "@/src/config/website-settings";
import MainLayout from "@/src/components/layout/MainLayout";
import type { SessionizeData, SessionizeSession, SessionizeSpeaker, SessionWithSpeakers } from "@/src/lib/sessionize";

export const metadata = {
    title: "Session Details | Bitbash"
};

export default async function SessionDetailPage({
    params,
}: {
    params: Promise<{ edition: string; sessionId: string; }>
}) {

    const { edition: editionParam, sessionId } = await params;
    const edition = editionParam ?? websiteSettings.currentEdition.slug;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/${edition}.json`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data: SessionizeData = await response.json();

        const sessionData = data.Sessions?.find((s) => s.Id === sessionId);
        if (!sessionData) return <div>Session not found.</div>;

        // Populate session.speakers with full speaker objects
        let session: SessionizeSession & Partial<Pick<SessionWithSpeakers, "Speakers">> = sessionData;
        if (session.speakers && Array.isArray(session.speakers)) {
            session = {
                ...session,
                Speakers: session.speakers
                    .map((speakerId: string) => data.Speakers.find((sp) => sp.Id === speakerId))
                    .filter((sp): sp is SessionizeSpeaker => Boolean(sp))
            };
        }

        return (
            <MainLayout>
                <Section headerText={session.Title} extraClass="mb-5">
                    <SessionDetailSection session={session} edition={edition} />
                </Section>
            </MainLayout>
        );
    } catch {
        return <div>Failed to load session.</div>;
    }
}