'use client'

import React from "react";
import Section from "../layout/Section";
import SpeakerCard from "./SpeakerCard";
import { websiteSettings } from "../../config/website-settings";
import useSWR from "swr";
import type { SessionizeData } from "@/src/lib/sessionize";

const fetcher = (url: string): Promise<SessionizeData> => fetch(url).then(r => r.json());

export default function SpeakersSection({ edition }: { edition?: string }) {

    const isCurrentEdition = edition === undefined;
    edition ??= websiteSettings.currentEdition.slug;
    const finalized = websiteSettings.currentEdition.speakers.finalized;

    const { data, error } = useSWR(`/data/${edition}.json`, fetcher);

    if (error) return <div className="lead text-center text-danger">Failed to load speakers.</div>;
    if (!data) return null;

    return (
        <Section headerText="Speakers" sectionBackground={3}>
            <div className="container text-light">
                {isCurrentEdition && !finalized && (
                    <div className="text-center mb-5">
                        <h2 className="text-light">We are still selecting speakers, so more announcements are on the way.</h2>
                    </div>
                )}
                <div className="row justify-content-center p-2">
                    {data.Speakers.map((speaker) => (
                        <div key={speaker.Id} className="col-md-4 d-flex justify-content-center">
                            <SpeakerCard speaker={speaker} edition={edition} />
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
