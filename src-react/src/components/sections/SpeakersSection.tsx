'use client'

import React from "react";
import Section from "../layout/Section";
import SpeakerCard from "./SpeakerCard";
import { websiteSettings } from "../../config/website-settings";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SpeakersSection() {

    const edition = websiteSettings.currentEdition;

    const { data, error } = useSWR(`/data/${edition.slug}.json`, fetcher);

    if (error) return <div className="lead text-center text-danger">Failed to load speakers.</div>;
    if (!data) return null;

    return (
        <Section headerText="Speakers" sectionBackground={3}>
            <div className="container text-light">
                <div className="row justify-content-center p-2">
                    {data.Speakers.map((speaker: any) => (
                        <div key={speaker.Id} className="col-md-4 d-flex justify-content-center">
                            <SpeakerCard speaker={speaker} />
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
