'use client'

import React from "react";
import Section from "../layout/Section";
import SpeakerCard from "./SpeakerCard";
import CallForPapers from "./CallForPapers";
import { websiteSettings } from "../../config/website-settings";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SpeakersSection() {
  const { data, error } = useSWR(`/data/${websiteSettings.currentEdition}.json`, fetcher);

  return (
    <Section headerText="Speakers" sectionBackground={3}>
      {websiteSettings.speakersAnnounced ? (
        <div className="container">
          {data && data.Speakers ? (
            <div className="row justify-content-center p-2">
              {data.Speakers.map((speaker: any) => (
                <div key={speaker.Id} className="col-md-4 d-flex justify-content-center">
                  <SpeakerCard speaker={speaker} />
                </div>
              ))}
            </div>
          ) : (
            <div className="row justify-content-center p-2">
              <p>Loading speakers...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="row text-center">
            <p>For the brightest ideas and newest perspectives, we're bringing the best minds together!</p>
            <p>Please stay tuned for updates on our website and social media channels for speaker announcements.</p>
          </div>
          <CallForPapers />
        </>)}
    </Section>
  );
}
