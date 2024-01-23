using Bitbash.Configuration;
using Bitbash.Models;
using System.Collections.Concurrent;
using System.Net.Http.Json;

namespace Bitbash.Services;

public class EventDetailsProvider
{
    private readonly HttpClient httpClient;
    private readonly ConcurrentDictionary<string, Task<EventDetails>> eventDetailTasks;

    public EventDetailsProvider(HttpClient httpClient, WebsiteSettings settings)
    {
        this.httpClient = httpClient;

        eventDetailTasks = new();
        // Preload data for current edition.
        GetEventDetailsAsync(settings.CurrentEdition);
    }

    public async Task<IEnumerable<Speaker>> GetSpeakersAsync(string edition)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Speakers
            .OrderBy(s => s.IsTopSpeaker)
            .ThenBy(s => s.FullName);
    }

    public async Task<Speaker?> GetSpeakerAsync(string edition, string speakerId)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Speakers.FirstOrDefault(s => s.Id == speakerId);
    }

    public async Task<IEnumerable<DateOnly>> GetEventDatesAsync(string edition)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Sessions
            .Where(s => s.StartsAt is not null)
            .GroupBy(s => s.StartsAt!.Value)
            .Select(g => DateOnly.FromDateTime(g.Key))
            .Distinct()
            .OrderBy(d => d);
    }

    public async Task<IEnumerable<IGrouping<DateTime, Session>>> GetScheduleAsync(string edition, DateOnly date)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Sessions
            .Where(s => s.StartsAt is not null && DateOnly.FromDateTime(s.StartsAt!.Value) == date)
            .GroupBy(s => s.StartsAt!.Value)
            .OrderBy(g => g.Key);
    }
    
    public async Task<IEnumerable<Session>> GetUpNextAsync(string edition, DateTime time)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        var sessionsByUpNextTime = eventDetails.Sessions
            .Where(s => s.StartsAt is not null && s.IsServiceSession is false)
            .GroupBy(s => s.StartsAt!.Value + (s.EndsAt - s.StartsAt) / 2)
            .OrderBy(g => g.Key)
            .ToList();
        
        var upNext = sessionsByUpNextTime
            .FirstOrDefault(g => g.Key > time);

        return upNext ?? sessionsByUpNextTime.Last();
    }

    public async Task<IEnumerable<IGrouping<DateTime, Session>>> GetUpNextTestSessionsAsync(string edition)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Sessions
            .Where(s => s.StartsAt is not null && s.IsServiceSession is false)
            .GroupBy(s => s.StartsAt!.Value)
            .OrderBy(g => g.Key)
            .ToList();
    }

    public async Task<Session?> GetSessionAsync(string edition, string sessionId)
    {
        var eventDetails = await GetEventDetailsAsync(edition);

        return eventDetails.Sessions.FirstOrDefault(s => s.Id == sessionId);
    }
    
    private Task<EventDetails> GetEventDetailsAsync(string edition)
    {
        if (eventDetailTasks.TryGetValue(edition, out var task))
        {
            return task;
        }

        return eventDetailTasks.GetOrAdd(edition, GetEventDetailsCoreAsync(edition));
    }
    
    private async Task<EventDetails> GetEventDetailsCoreAsync(string edition)
    {
        Console.WriteLine($"Loading event details for {edition}...");

        // Prevent caching.
        var url = $"/data/{edition}.json?ts={DateTime.UtcNow.Ticks}";

        var eventDetails = await httpClient.GetFromJsonAsync<EventDetails>(url);
        eventDetails ??= new();

        // Enrich data with cross-references.
        foreach (var speaker in eventDetails.Speakers)
        {
            foreach (var sessionId in speaker.SessionIds)
            {
                var session = eventDetails.Sessions.FirstOrDefault(s => s.Id == sessionId);
                if (session is not null)
                {
                    speaker.Sessions.Add(session);
                    session.Speakers.Add(speaker);
                }
            }
        }

        return eventDetails;
    }
}