export interface WebsiteSettings {
  currentEdition: string;
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

export const websiteSettings: WebsiteSettings = {
  currentEdition: "winter-2026",
  currentEditionTitle: "2026",
  currentEditionPhotosPublished: false,
  previousEdition: "winter-2025",
  previousEditionTitle: "2025", 
  preConWorkshopsDate: "2026-01-23",
  conferenceDate: "2026-01-24",
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
  conferenceTicketSaleOpened: false,
  conferenceTicketSoldOut: false,
  workshopTicketSaleOpened: false,
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