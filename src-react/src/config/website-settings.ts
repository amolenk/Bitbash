export interface WebsiteSettings {
    admitto: AdmittoSettings;
    currentEdition: EditionSettings;
    currentEditionTitle: string;
    currentEditionPhotosPublished: boolean;
    previousEdition: string;
    previousEditionTitle: string;
    preConWorkshopsDate: string;
    conferenceDate: string;
    agendaAnnounced: boolean;
    agendaFinalized: boolean;
    speakersAnnounced: boolean;
    sessionizeCfpLink: string;
    cfpOpenTime: string;
    cfpCloseTime: string;
    hubSpotRegion: string;
    hubSpotPortalId: string;
    hubSpotWorkshopTicketFormId: string;
    hubSpotConferenceTicketFormId: string;
    conferenceTicketSaleOpened: boolean;
    conferenceTicketSoldOut: boolean;
    workshopTicketSaleOpened: boolean;
    workshopTicketSoldOut: boolean;
    aftermovies: Record<string, string>;
    previousEditions: Record<string, {
        title: string;
        image: string;
    }>;
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
    },
    currentEditionTitle: "Bitbash 2025",
    currentEditionPhotosPublished: false,
    previousEdition: "winter-2024",
    previousEditionTitle: "2024",
    preConWorkshopsDate: "2025-01-24",
    conferenceDate: "2025-01-25",
    agendaAnnounced: false,
    agendaFinalized: false,
    speakersAnnounced: false,
    sessionizeCfpLink: "https://sessionize.com/bitbash-2026",
    cfpOpenTime: "2025-07-07T13:00:00+02:00",
    cfpCloseTime: "2025-09-15T23:59:00+02:00",
    hubSpotRegion: "eu1",
    hubSpotPortalId: "25807913",
    hubSpotWorkshopTicketFormId: "a3d34d60-aa1f-453d-8f63-29ccee196660",
    hubSpotConferenceTicketFormId: "69e6d1c9-e1a0-4207-ae1d-c041fb07f074",
    conferenceTicketSaleOpened: true,
    conferenceTicketSoldOut: false,
    workshopTicketSaleOpened: true,
    workshopTicketSoldOut: false,
    aftermovies: {
        "winter-2025": "https://www.youtube-nocookie.com/embed/RaM_pxesCcc?si=rsGEjH0zVlnNAJiy"
    },
    previousEditions: {
        "winter-2024": {
            title: "Far far away",
            image: "./img/winter-2024/farfaraway.jpg"
        },
        "winter-2025": {
            title: "Haunted",
            image: "./img/winter-2025/hauntedEdition.jpg"
        }
    }
};
