export interface WebsiteSettings {
  admittoUrl: string;
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
  admittoUrl: "https://app-admitto-api-utzwls7ov7ne2.wittysand-e7b3762f.swedencentral.azurecontainerapps.io",
  currentEdition: "winter-2025",
  currentEditionTitle: "Bitbash 2025",
  currentEditionPhotosPublished: false,
  previousEdition: "winter-2024",
  previousEditionTitle: "2024", 
  preConWorkshopsDate: "2025-01-24",
  conferenceDate: "2025-01-25",
  agendaAnnounced: true,
  agendaFinalized: true,
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