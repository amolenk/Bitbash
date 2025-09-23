'use client'

import React from "react";
import Section from "@/src/components/layout/Section";
import SessionDetailSection from "@/src/components/sections/SessionDetailSection";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { websiteSettings } from "@/src/config/website-settings";
import MainLayout from "@/src/components/layout/MainLayout";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const metadata = {
    title: "Session Details | Bitbash"
};

export default function SessionDetailPage() {
  const params = useParams();
  const edition = params?.edition || websiteSettings.currentEdition;
  const sessionId = params?.sessionId;
  const { data, error } = useSWR(`/data/${edition}.json`, fetcher);

  if (error) return <div>Failed to load session.</div>;
  if (!data) return null;

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
}
