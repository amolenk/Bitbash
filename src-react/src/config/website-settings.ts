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
    codeOfConduct: CodeOfConductSettings;

    isCurrentlyTakingPlace: () => boolean;
}

export interface PastEditionSettings {
    slug: string;
    description: string;
    photoCount: number;
    aftermovieYoutubeId?: string;
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
    timeZone: string;
    upNext: UpNextSettings;
}

interface UpNextSettings {
    delayInMinutes: number;
    goodbyeMessage: string;
}

interface CodeOfConductSettings {
    contacts: CodeOfConductContactSettings[];
}

interface CodeOfConductContactSettings {
    name: string;
    phoneNumber: string;
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
        isCurrentlyTakingPlace: function () {
            const options = { timeZone: 'Europe/Amsterdam' };
            const today = (new Date()).toLocaleDateString('nl-NL', options);
            return today === this.workshopsDate.toLocaleDateString('nl-NL', options)
                || today === this.conferenceDate.toLocaleDateString('nl-NL', options);
        },
        registration: {
            opensAt: new Date("2025-09-20T12:00:00+02:00"),
            closesAt: new Date("2026-01-22T09:00:00+01:00"),
            enabled: false,
            isOpen: function () {
                const now = new Date();
                return this.enabled && now >= this.opensAt && now <= this.closesAt;
            }
        },
        schedule: {
            announced: true,
            finalized: true,
            timeZone: "+01:00",
            upNext:
            {
                delayInMinutes: 20,
                goodbyeMessage: "Thanks for attending Bitbash 2026! See you next year!"
            }
        },
        speakers: {
            announced: true
        },
        codeOfConduct: {
            contacts: [
                {
                    name: "Manon van der Werff",
                    phoneNumber: "06 44 07 64 39"
                },
                {
                    name: "Sander Molenkamp",
                    phoneNumber: "06 45 37 85 40"
                }
            ]
        }
    },
    pastEditions: [
        {
            slug: "winter-2024",
            description: "2024: Far, Far Away Edition",
            photoCount: 28
        },
        {
            slug: "winter-2025",
            description: "2025: Haunted Edition",
            photoCount: 30,
            aftermovieYoutubeId: "RaM_pxesCcc?si=rsGEjH0zVlnNAJiy"
        },
        {
            slug: "winter-2026",
            description: "2026: Jurassic Edition",
            photoCount: 81,
            aftermovieYoutubeId: "GiZqIx8UB6g?si=BLxRYRczOKkD341Y"
        },
    ]
};
