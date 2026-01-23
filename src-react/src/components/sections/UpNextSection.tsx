'use client';

import UpNextCard from "@/src/components/sections/UpNextCard";
import {getSessionCatalog, SessionWithSpeakers} from "@/src/lib/sessionize";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {websiteSettings} from "../../config/website-settings";

type SessionGroup = { startTime: Date; sessions: SessionWithSpeakers[] };

function buildUpcomingGroups(
    sessions: SessionWithSpeakers[],
    tzOffset: string
): SessionGroup[] {
    const speakerSessions = sessions
        .filter((s) => s.StartsAt && !s.IsServiceSession)
        .map((s) => ({
            session: s,
            startsAtDate: new Date(`${s.StartsAt!}${tzOffset}`),
        }))
        .sort((a, b) =>
            a.startsAtDate.getTime() - b.startsAtDate.getTime());

    const groups = new Map<number, SessionWithSpeakers[]>();
    for (const s of speakerSessions) {
        const key = s.startsAtDate.getTime();
        const arr = groups.get(key) ?? [];
        arr.push(s.session);
        groups.set(key, arr);
    }

    return Array.from(groups.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([ts, sess]) =>
            ({startTime: new Date(ts), sessions: sess}));
}

function getNextGroup(
    groups: SessionGroup[],
    now: Date
): SessionGroup | undefined {

    return groups.find((g) => g.startTime.getTime() >= now.getTime());
}

export function UpNextSection({isTest}: { isTest: boolean }) {
    const tzOffset = websiteSettings.currentEdition.schedule.timeZone;
    const edition = websiteSettings.currentEdition.slug;

    const [allSessions, setAllSessions] = useState<SessionWithSpeakers[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Test-mode index
    const [testIndex, setTestIndex] = useState(0);

    // Keep timers stable
    const testTimerRef = useRef<number | null>(null);

    // 1) Fetch once on mount (and optionally re-fetch on a slow interval)
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {

            setLoadError('Going to load data!');
            try {
                const response = await fetch(`/api/sessions/${edition}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const sessions = await response.json() as SessionWithSpeakers[];
                if (!cancelled) {
                    setAllSessions(sessions);
                    setLoadError(null);
                    setLoading(false);
                }
            } catch (e) {
                if (!cancelled) {
                    setLoadError("Failed to load sessions: " + (e as Error).message);
                }
            }
        };

        fetchData();

        // Optional: slow polling for signage robustness (e.g. every 60s)
        const POLL_MS = 60_000;
        const pollId = window.setInterval(fetchData, POLL_MS);

        return () => {
            cancelled = true;
            window.clearInterval(pollId);
        };
    }, [edition]);

    // 2) Precompute grouped schedule
    const groups = useMemo(
        () => buildUpcomingGroups(allSessions, tzOffset),
        [allSessions, tzOffset]);

    // 3) Real "now" (updates)
    const [now, setNow] = useState<Date>(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 10_000); // update every 10s
        return () => window.clearInterval(id);
    }, []);

    // 4) Determine what to show
    const nextGroup = useMemo(() => {
        // Use a slightly past time to avoid showing "next" during the start of ongoing sessions
        const timestamp = new Date(now.getTime() - websiteSettings.currentEdition.schedule.upNext.delayInMinutes * 60_000)
        return getNextGroup(groups, timestamp);
    }, [groups, now]);

    // 5) Test mode cycling: iterate through upcoming groups every N seconds
    useEffect(() => {
        if (!isTest || groups.length === 0) return;

        const TEST_CYCLE_MS = 3_000;

        // Start from first group if index out of range
        setTestIndex((i) => (i >= groups.length ? 0 : i));

        testTimerRef.current = window.setInterval(() => {
            setTestIndex((i) => (i + 1) % groups.length);
        }, TEST_CYCLE_MS);

        return () => {
            if (testTimerRef.current) window.clearInterval(testTimerRef.current);
            testTimerRef.current = null;
        };
    }, [isTest, groups.length]);

    const groupToRender = isTest
        ? groups[testIndex]
        : nextGroup;

    if (loadError) {
        return <div className="lead text-center text-danger">{loadError}</div>;
    }

    if (loading) {
        return <div className="lead text-center text-light">Loading... {new Date().toLocaleTimeString()}</div>;
    }

    if (!groupToRender || groupToRender.sessions.length === 0) {
        return (
            <div className="container text-center" style={{padding: 64}}>
                <h2 className="text-light mt-8 mb-4">No upcoming sessions</h2>
                <h1 className="text-light">{websiteSettings.currentEdition.schedule.upNext.goodbyeMessage}</h1>
            </div>
        );
    }

    const startLabel = groupToRender.startTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="container text-center">
            <div style={{padding: 64}}>
                <h1 className="text-light mt-8 mb-8">
                    Next sessions starting at {startLabel}
                </h1>
            </div>

            <div className="row g-3 p-2 justify-content-center">
                {groupToRender.sessions.map((session) => (
                    <div key={session.Id} className="col d-flex">
                        <UpNextCard session={session}/>
                    </div>
                ))}
            </div>

            {isTest && (
                <h2 className="text-light my-3">⚠️ Test mode is enabled</h2>
            )}
        </div>
    );
}