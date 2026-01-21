'use client';

import {websiteSettings} from "@/src/config/website-settings";
import {getSessionCatalog, SessionWithSpeakers} from "@/src/lib/sessionize";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpNextClient({
                                         children,
                                         interval = 30000,
                                         isTest = false,
                                         testTime = undefined
                                     }: {
    children: React.ReactNode;
    interval?: number;
    isTest?: boolean;
    testTime?: Date
}) {

    const [sessions, setSessions] = useState<SessionWithSpeakers[]>([]); // based on your data you should store it here in state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSessionCatalog(websiteSettings.currentEdition.slug);
                setSessions(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // var index =


    // const start = websiteSettings.currentEdition.workshopsDate;
    // const end = websiteSettings.currentEdition.conferenceDate;
    //
    // const router = useRouter();
    // const [currentTime, setCurrentTime] = useState<Date>(() => {
    //     return testTime ?? websiteSettings.currentEdition.conferenceDate;
    // });
    //
    // useEffect(() => {
    //     if (!isTest) return;
    //
    //     const intervalId = setInterval(() => {
    //         setCurrentTime(prev => {
    //             const next = new Date(prev);
    //             next.setMinutes(next.getMinutes() + 30);
    //
    //             // Reset to start if we've passed the end
    //
    //         });
    //     }, interval);
    //
    //     return () => clearInterval(intervalId);
    // }, [router, interval, isTest]);

    return <>{children}</>;
}
