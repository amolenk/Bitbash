'use client'

import React from "react";
import Section from "../layout/Section";
import AgendaTabs from "./AgendaTabs";
import SessionCard from "./SessionCard";
import { websiteSettings } from "../../config/website-settings";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import type { SessionizeData, SessionizeSession, SessionizeSpeaker } from "@/src/lib/sessionize";

type AgendaSession = SessionizeSession & {
    Speakers?: SessionizeSpeaker[];
    slotNames?: string[];
};

const fetcher = (url: string): Promise<SessionizeData> => fetch(url).then(r => r.json());

function parseDate(dateStr?: string): Date {
    // If no date string provided, return default conference date (second day)
    if (!dateStr)
    {
        return websiteSettings.currentEdition.conferenceDate;
    }    
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
}

function setTimeZone(date: Date, tzOffset: string): Date {
    const isoString = date.toISOString();
    const timeZoneString = isoString.substring(0, isoString.length - 1) + tzOffset;
    return new Date(timeZoneString);
}

export default function AgendaSection() {

    const searchParams = useSearchParams();

    const edition = websiteSettings.currentEdition;
    const selectedDate = parseDate(searchParams.get("date") || undefined);
    const { data, error } = useSWR(`/data/${edition.slug}.json`, fetcher);

    if (error) return <div className="lead text-center text-danger">Failed to load agenda.</div>;
    if (!data) return null;

    // Get all unique dates from sessions
    const eventDates: Date[] = (Array.from(
        new Set(
            data.Sessions
                .filter((s) => s.StartsAt)
                .map((s) => new Date(s.StartsAt!.split('T')[0]))
                .map((d) => setTimeZone(d, websiteSettings.currentEdition.schedule.timeZone).toISOString())
        )
    )).map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

    // Group sessions by start time for selected date
    const sessionsForDate = data.Sessions.filter((s) => {
        const sessionDate = setTimeZone(new Date(s.StartsAt?.split('T')[0] ?? ''), websiteSettings.currentEdition.schedule.timeZone);
        return sessionDate.toISOString() === selectedDate.toISOString();
    });

    // Populate Speakers for each session
    const sessionsWithSpeakers = sessionsForDate.map((session): AgendaSession => {
        if (session.speakers && Array.isArray(session.speakers)) {
            return {
                ...session,
                Speakers: session.speakers
                    .map((speakerId: string) => data.Speakers.find((sp) => sp.Id === speakerId))
                    .filter((sp): sp is SessionizeSpeaker => Boolean(sp))
            };
        }
        return session;
    });

    // Split full-day workshops into morning and afternoon
    const finalSessions: AgendaSession[] = [];
    sessionsWithSpeakers.forEach((session) => {

        if (session.SessionFormat === "Full-day workshop")
        {
            // Split into morning and afternoon
            const datePart = session.StartsAt!.split("T")[0];
            finalSessions.push({
                ...session,
                StartsAt: `${datePart}T09:00:00`,
                EndsAt: `${datePart}T12:00:00`,
                Title: session.Title + " (part 1)",
            });
            finalSessions.push({
                ...session,
                slotNames: ["afternoon-workshop"],
                StartsAt: `${datePart}T13:00:00`,
                EndsAt: `${datePart}T16:00:00`,
                Title: session.Title + " (part 2)",
            });
        }
        else {
            finalSessions.push(session);
        }
    });

    // Sort sessions by start time and room
    finalSessions.sort((a, b) => {
        const startA = a.StartsAt || "";
        const startB = b.StartsAt || "";
        const roomA = a.Room || "";
        const roomB = b.Room || "";
        if (startA < startB) return -1;
        if (startA > startB) return 1;
        if (roomA < roomB) return -1;
        if (roomA > roomB) return 1;
        return 0;
    });

    const slots: [string, AgendaSession[]][] = Array.from(
        finalSessions.reduce((acc, session) => {
            if (!session.StartsAt || !session.EndsAt) return acc;
            const key = `${session.StartsAt.split('T')[1]}-${session.EndsAt.split('T')[1]}`;
            if (!acc.has(key)) acc.set(key, []);
            acc.get(key)!.push(session);
            return acc;
        }, new Map<string, AgendaSession[]>())
    );

    return (
        <Section headerText="Agenda" sectionBackground={2}>
            {eventDates.length > 0 && (
                <AgendaTabs dates={eventDates} selectedDate={selectedDate} />
            )}
            <div className="container mb-4">
                {!edition.schedule.finalized && (
                    <div className="text-center mb-5">
                        <h2 className="text-light">The agenda is still being finalized, and session times are subject to change.</h2>
                    </div>
                )}
                {slots.map(([slotKey, slotSessions]) => {
                    const [start, end] = slotKey.split('-');
                    return (
                        <React.Fragment key={slotKey}>
                            <div className="row text-center">
                                <h2 className="text-light">{`${start.slice(0, 5)} - ${end.slice(0, 5)}`}</h2>
                            </div>
                            <div className="d-flex flex-row flex-wrap justify-content-center gap-2">
                                {slotSessions.map((session) => (

                                    <SessionCard key={session.Id} session={session} />
                                ))}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </Section>
    );
}
