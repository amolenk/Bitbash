import React from "react";
import Section from "../layout/Section";

import SessionCard from "@/src/components/sections/SessionCard";

interface SpeakerSessionsSectionProps {
    sessions: string[];
    allSessions: any[];
}

export default function SpeakerSessionsSection({ sessions, allSessions }: SpeakerSessionsSectionProps) {
    return (
        <Section headerText="Sessions" sectionBackground={5} extraClass="pb-5">
            <div className="row d-flex justify-content-center">
                {sessions.map((sessionId: string) => {
                    const session = allSessions.find((sess: any) => sess.Id === sessionId);
                    return session ? (
                        <div key={session.Id} className="col-md-6 d-flex justify-content-center">
                            <SessionCard session={session} />
                        </div>
                    ) : null;
                })}
            </div>
        </Section>
    );
}
