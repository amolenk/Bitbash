import UpNextCard from "@/src/components/sections/UpNextCard";
import {getSessionCatalog, SessionWithSpeakers} from "@/src/lib/sessionize";
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

export async function UpNextSection() {
    const tzOffset = websiteSettings.currentEdition.schedule.timeZone;
    const edition = websiteSettings.currentEdition.slug;

    const allSessions = await getSessionCatalog(edition);

    const groups = buildUpcomingGroups(allSessions, tzOffset);

    const timestamp = new Date(new Date().getTime() - websiteSettings.currentEdition.schedule.upNext.delayInMinutes * 60_000)
    // Use a slightly past time to avoid showing "next" during the start of ongoing sessions
    const nextGroup = getNextGroup(groups, timestamp);

    if (!nextGroup || nextGroup.sessions.length === 0) {
        return (
            <div className="container text-center" style={{padding: 64}}>
                <h2 className="text-light mt-8 mb-4">No upcoming sessions</h2>
                <h1 className="text-light">{websiteSettings.currentEdition.schedule.upNext.goodbyeMessage}</h1>
            </div>
        );
    }

    const startLabel = nextGroup.startTime.toLocaleTimeString('nl-NL', {
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
                {nextGroup.sessions.map((session) => (
                    <div key={session.Id} className="col d-flex">
                        <UpNextCard session={session}/>
                    </div>
                ))}
            </div>
        </div>
    );
}