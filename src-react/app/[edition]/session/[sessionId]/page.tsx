import React, { Suspense } from "react";
import Section from "@/src/components/layout/Section";
import SessionDetailSection from "@/src/components/sections/SessionDetailSection";
import { websiteSettings } from "@/src/config/website-settings";
import MainLayout from "@/src/components/layout/MainLayout";

export const metadata = {
    title: "Session Details | Bitbash"
};

export default async function SessionDetailPage({
    params,
}: {
    params: Promise<{ edition: string; sessionId: string; }>
}) {

    let { edition, sessionId } = await params;
    edition = edition ?? websiteSettings.currentEdition.slug;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/${edition}.json`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        let session = data.Sessions?.find((s: any) => s.Id === sessionId);
        if (!session) return <div>Session not found.</div>;

        // Populate session.speakers with full speaker objects
        if (session.speakers && Array.isArray(session.speakers)) {
            session = {
                ...session,
                Speakers: session.speakers
                    .map((speakerId: string) => data.Speakers.find((sp: any) => sp.Id === speakerId))
                    .filter(Boolean)
            };
        }

        return (
            <MainLayout>
                <Section headerText={session.Title} extraClass="mb-5">
                    <SessionDetailSection session={session} />
                </Section>
            </MainLayout>
        );
    } catch (error: any) {
        return <div>Failed to load session.</div>;
    }
}