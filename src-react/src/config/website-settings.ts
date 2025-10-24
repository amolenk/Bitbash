export interface WebsiteSettings {
    admitto: AdmittoSettings;
    currentEdition: EditionSettings;
    pastEditions: PastEditionSettings[];
}

interface AdmittoSettings {
    baseUrl: string;
    teamSlug: string;
    eventSlug: string;
    mainConferenceTicketSlug: string;
}

interface EditionSettings {
    slug: string;
    description: string;
    workshopsDate: Date;
    conferenceDate: Date;
    registration: RegistrationSettings;
    schedule: ScheduleSettings;
    speakers: SpeakerSettings;
}

export interface PastEditionSettings {
    slug: string;
    description: string;
    photoCount: number;
}

interface RegistrationSettings {
    opensAt: Date;
    closesAt: Date;
    enabled: boolean;

    isOpen: () => boolean;
}

interface ScheduleSettings {
    announced: boolean;
    finalized: boolean;
}

interface SpeakerSettings {
    announced: boolean;
}


export const websiteSettings: WebsiteSettings = {
    admitto: {
        baseUrl: process.env.NEXT_PUBLIC_ADMITTO_URL || "https://admitto.sandermolenkamp.com",// "http://localhost:5100",
        teamSlug: "bitbash",
        eventSlug: "bitbash-2026",
        mainConferenceTicketSlug: "conference"
    },
    currentEdition: {
        slug: "winter-2026",
        description: "Jurassic edition",
        workshopsDate: new Date("2026-01-23T00:00:00+01:00"),
        conferenceDate: new Date("2026-01-24T00:00:00+01:00"),
        registration: {
            opensAt: new Date("2025-09-20T12:00:00+02:00"),
            closesAt: new Date("2026-01-22T09:00:00+01:00"),
            enabled: true,
            isOpen: function () {
                const now = new Date();
                return this.enabled && now >= this.opensAt && now <= this.closesAt;
            }
        },
        schedule: {
            announced: true,
            finalized: true
        },
        speakers: {
            announced: true
        }
    },
    pastEditions: [
        {
            slug: "winter-2024",
            description: "2024: Far, Far Away edition",
            photoCount: 28
        },
        {
            slug: "winter-2025",
            description: "2025: Haunted edition",
            photoCount: 30
        },
    ]
};
