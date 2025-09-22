'use client'

import React from "react";
import Section from "../layout/Section";

export default function SpeakersPendingSection() {

    return (
        <Section headerText="Speakers" sectionBackground={2}>
            <div className="row lead text-light text-center">
                <p>For the brightest ideas and newest perspectives, we're bringing the best minds together!</p>
                <p>Please stay tuned for updates on our website and social media channels for speaker announcements.</p>
            </div>
        </Section>
    );
}
