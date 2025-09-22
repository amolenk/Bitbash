'use client'

import React from "react";
import Section from "../layout/Section";
import CallForPapers from "./CallForPapers";
import { useParams, useRouter } from "next/navigation";

export default function AgendaSection() {
    const params = useParams();
    const router = useRouter();

    return (
        <Section headerText="Agenda" sectionBackground={2}>
            <div className="row lead text-light text-center">
                <p>We are currently working diligently to finalize the agenda for the event.</p>
                <p>Please check back soon for the full agenda, which will be published as soon as it is confirmed.</p>
            </div>

            <CallForPapers />
        </Section>
    );
}
