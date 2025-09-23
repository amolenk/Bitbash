export interface WebsiteSettings {
    admitto: AdmittoSettings;
    currentEdition: EditionSettings;
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
        baseUrl: "http://localhost:5100",
        teamSlug: "bitbash",
        eventSlug: "bitbash-2026",
        mainConferenceTicketSlug: "conference"
    },
    currentEdition: {
        slug: "winter-2026",
        description: "Jurassic edition",
        workshopsDate: new Date("2026-01-23T00:00:00+02:00"),
        conferenceDate: new Date("2026-01-24T00:00:00+02:00"),
        registration: {
            opensAt: new Date("2025-09-20T12:00:00+02:00"),
            closesAt: new Date("2026-01-22T09:00:00+02:00"),
            enabled: false,
            isOpen: function () {
                const now = new Date();
                return this.enabled && now >= this.opensAt && now <= this.closesAt;
            }
        },
        schedule: {
            announced: true,
            finalized: false
        },
        speakers: {
            announced: true
        }
    }
};
