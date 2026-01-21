interface SessionizeData {
    Speakers: SessionizeSpeaker[];
    Sessions: SessionizeSession[];
}

interface SessionizeSpeaker {
    Id: string;
    FullName: string;
    Bio: string;
    TagLine: string;
    ProfilePictureUrl: string;
    sessions: string[];
}

interface SessionizeSession {
    Id: string;
    Title: string;
    Description?: string;
    StartsAt?: string;
    EndsAt?: string;
    IsServiceSession?: boolean;
    speakers: string[];
    SessionFormat?: string;
    Level?: string;
    Room?: string;
}

export interface SessionWithSpeakers extends SessionizeSession {
    Speakers: SessionizeSpeaker[];
}

export async function getSessionCatalog(edition: string) {

    const sessionizeData = await fetchSessionizeData(edition);

    const sessionsWithSpeakers = sessionizeData.Sessions
        .map((s) => attachSpeakers(s, sessionizeData.Speakers));

    // Split full-day workshops into two parts so afternoon shows as a separate start time
    const normalized: SessionWithSpeakers[] = [];
    sessionsWithSpeakers.forEach((session) => {
        if (session.SessionFormat === "Full-day workshop") {
            normalized.push(...splitFullDaySessions(session));
        } else {
            normalized.push(session);
        }
    });

    console.log(normalized);

    return normalized;
}

function fetchSessionizeData(edition: string): Promise<SessionizeData> {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/${edition}.json`;
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${url}`);
            }
            return response.json();
        })
        .then((data) => {
            return data as SessionizeData;
        });
}

function attachSpeakers(session: SessionizeSession, speakers: SessionizeSpeaker[]): SessionWithSpeakers {
    if (session.speakers && Array.isArray(session.speakers)) {
        return {
            ...session,
            Speakers: session.speakers
                .map((speakerId: string) => speakers
                    .find((sp) => sp.Id === speakerId))
                .filter(Boolean) as SessionizeSpeaker[] // Remove falsy values
        };
    }
    return {
        ...session,
        Speakers: []
    };
}

function splitFullDaySessions(session: SessionWithSpeakers) {
    // Full-day workshops are split to morning and afternoon parts for agenda/up-next views
    const parts: SessionWithSpeakers[] = [];
    const datePart = session.StartsAt!.split("T")[0];
    parts.push({
        ...session,
        StartsAt: `${datePart}T09:00:00`,
        EndsAt: `${datePart}T12:00:00`,
        Title: `${session.Title} (part 1)`
    });
    parts.push({
        ...session,
        StartsAt: `${datePart}T13:00:00`,
        EndsAt: `${datePart}T16:00:00`,
        Title: `${session.Title} (part 2)`
    });
    return parts;
}


