'use client'

import React from "react";
import Section from "../layout/Section";
import AgendaTabs from "./AgendaTabs";
import SessionCard from "./SessionCard";
import CallForPapers from "./CallForPapers";
import { websiteSettings } from "../../config/website-settings";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function AgendaSection() {
  const params = useParams();
  const router = useRouter();
  const edition = websiteSettings.currentEdition;
  const selectedDate = parseDate(params?.date as string);
  const { data, error } = useSWR(`/data/${edition}.json`, fetcher);

  if (error) return <div>Failed to load agenda.</div>;
  if (!data) return null;

  // Get all unique dates from sessions
  const eventDates: Date[] = (Array.from(
    new Set(
      data.Sessions
        .filter((s: any) => s.StartsAt)
        .map((s: any) => new Date(s.StartsAt.split('T')[0]))
        .map((d: Date) => d.toISOString())
    )
  ) as string[]).map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

  // Clamp selectedDate to valid range
  const clampedDate = (() => {
    if (eventDates.length === 0) return new Date();
    if (selectedDate < eventDates[0]) return eventDates[0];
    if (selectedDate > eventDates[eventDates.length - 1]) return eventDates[eventDates.length - 1];
    return selectedDate;
  })();

  // Group sessions by start time for selected date
  const sessionsForDate = data.Sessions.filter((s: any) => {
    const sessionDate = new Date(s.StartsAt?.split('T')[0]);
    return sessionDate.getTime() === clampedDate.getTime();
  });

  // Populate Speakers for each session
  const sessionsWithSpeakers = sessionsForDate.map((session: any) => {
    if (session.speakers && Array.isArray(session.speakers)) {
      return {
        ...session,
        Speakers: session.speakers
          .map((speakerId: string) => data.Speakers.find((sp: any) => sp.Id === speakerId))
          .filter(Boolean)
      };
    }
    return session;
  });

  const slots: [string, any[]][] = Array.from(
    sessionsWithSpeakers.reduce((acc: Map<string, any[]>, session: any) => {
      if (!session.StartsAt || !session.EndsAt) return acc;
      const key = `${session.StartsAt.split('T')[1]}-${session.EndsAt.split('T')[1]}`;
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)!.push(session);
      return acc;
    }, new Map<string, any[]>())
  );

  return (
    <Section headerText="Agenda" sectionBackground={2}>
      {websiteSettings.agendaAnnounced ? (
        <>
          {eventDates.length > 0 && (
            <AgendaTabs dates={eventDates} selectedDate={clampedDate} />
          )}
          <div className="container">
            {!websiteSettings.agendaFinalized && (
              <div className="text-center mb-5">
                <h2>The agenda is still being finalized, and session times are subject to change.</h2>
              </div>
            )}
            {slots.map(([slotKey, slotSessions]: [string, any[]]) => {
              const [start, end] = slotKey.split('-');
              return (
                <React.Fragment key={slotKey}>
                  <div className="row text-center">
                    <h2>{`${start.slice(0,5)} - ${end.slice(0,5)}`}</h2>
                  </div>
                  <div className="row justify-content-center p-2">
                    {slotSessions.map((session: any) => (
                      <SessionCard key={session.Id} session={session} />
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : (
        <div className="row text-center">
          <p>We are currently working diligently to finalize the agenda for the event.</p>
          <p>Please check back soon for the full agenda, which will be published as soon as it is confirmed.</p>
        </div>
      )}
      <CallForPapers />
    </Section>
  );
}
