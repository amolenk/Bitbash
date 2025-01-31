namespace Bitbash.Web.Configuration;

public class WebsiteSettings
{
    public string CurrentEdition { get; init; } = string.Empty;
    public string CurrentEditionTitle { get; init; } = string.Empty;
    public bool CurrentEditionPhotosPublished { get; init; } = false;
    public string PreviousEdition { get; init; } = string.Empty;
    public string PreviousEditionTitle { get; init; } = string.Empty;
    public DateOnly PreConWorkshopsDate { get; init; }
    public DateOnly ConferenceDate { get; init; }
    public bool AgendaAnnounced { get; init; } = false;
    public bool AgendaFinalized { get; init; } = false;
    public bool SpeakersAnnounced { get; init; } = false;
    public string? SessionizeCfpLink { get; init; }
    public DateTimeOffset CfpOpenTime { get; init; }
    public DateTimeOffset CfpCloseTime { get; init; }
    public bool ConferenceTicketSaleOpened { get; init; } = false;
    public bool ConferenceTicketSoldOut { get; init; } = false;
    public bool WorkshopTicketSaleOpened { get; init; } = false;
    public bool WorkshopTicketSoldOut { get; init; } = false;
    public string? HubSpotRegion { get; init; }
    public string? HubSpotPortalId { get; init; }
    public string? HubSpotWorkshopTicketFormId { get; init; }
    public string? HubSpotConferenceTicketFormId { get; init; }
    
    public bool IsCallForPapersOpen => !string.IsNullOrWhiteSpace(SessionizeCfpLink)
        && CfpOpenTime <= DateTime.UtcNow
        && CfpCloseTime >= DateTime.UtcNow;
}