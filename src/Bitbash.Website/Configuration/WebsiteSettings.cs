namespace Bitbash.Configuration;

public class WebsiteSettings
{
    public string CurrentEdition { get; set; } = string.Empty;

    public bool SpeakersAnnounced { get; set; } = false;

    public string? EventbriteLink { get; set; }
}