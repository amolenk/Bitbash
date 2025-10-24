'use client'

import React from "react";
import Section from "../layout/Section";

import SessionCard from "@/src/components/sections/SessionCard";
import { websiteSettings } from "@/src/config/website-settings";

interface SpeakerSessionsSectionProps {
    sessions: string[];
    allSessions: any[];
    edition?: string;
}

export default function SpeakerSessionsSection({ sessions, allSessions, edition }: SpeakerSessionsSectionProps) {
    
    edition ??= websiteSettings.currentEdition.slug;
    
    return (
        <Section headerText="Sessions" sectionBackground={5} extraClass="pb-5">
            <div className="row d-flex justify-content-center">
                {sessions.map((sessionId: string) => {
                    const session = allSessions.find((sess: any) => sess.Id === sessionId);
                    return session ? (
                        <div key={session.Id} className="col-md-6 d-flex justify-content-center">
                            <SessionCard session={session} edition={edition} />
                        </div>
                    ) : null;
                })}
            </div>
        </Section>
    );
}
