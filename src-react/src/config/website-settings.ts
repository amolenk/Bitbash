export interface WebsiteSettings {
    currentEdition: EditionSettings;
    pastEditions: PastEditionSettings[];
}

interface EditionSettings {
    slug: string;
    description: string;
    workshopsDate: Date;
    conferenceDate: Date;
    registration: RegistrationSettings;
    callForPapers: CallForPapersSettings;
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

interface CallForPapersSettings {
    opensAt: Date;
    closesAt: Date;
    url: string;

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
    currentEdition: {
        slug: "winter-2027",
        description: "Rock 'n' Roll Edition",
        workshopsDate: new Date("2027-01-22T00:00:00+01:00"),
        conferenceDate: new Date("2027-01-23T00:00:00+01:00"),
        isCurrentlyTakingPlace: function () {
            const options = { timeZone: 'Europe/Amsterdam' };
            const today = (new Date()).toLocaleDateString('nl-NL', options);
            return today === this.workshopsDate.toLocaleDateString('nl-NL', options)
                || today === this.conferenceDate.toLocaleDateString('nl-NL', options);
        },
        registration: {
            opensAt: new Date("2026-04-01T12:00:00+02:00"),
            closesAt: new Date("2027-01-22T09:00:00+01:00"),
            enabled: true,
            isOpen: function () {
                const now = new Date();
                return this.enabled && now >= this.opensAt && now <= this.closesAt;
            }
        },
        callForPapers: {
            opensAt: new Date("2026-06-18T13:00:00+02:00"),
            closesAt: new Date("2026-09-15T23:59:00+02:00"),
            url: "https://sessionize.com/bitbash-2027",
            isOpen: function () {
                const now = new Date();
                return now >= this.opensAt && now <= this.closesAt;
            }
        },
        schedule: {
            announced: false,
            finalized: false,
            timeZone: "+01:00",
            upNext:
            {
                delayInMinutes: 20,
                goodbyeMessage: "Thanks for attending Bitbash! See you next year!"
            }
        },
        speakers: {
            announced: false
        },
        codeOfConduct: {
            contacts: []
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
            aftermovieYoutubeId: "GaaDZF5TpDw?si=SlAI-fWYydJS9iEp"
        },
    ]
};
