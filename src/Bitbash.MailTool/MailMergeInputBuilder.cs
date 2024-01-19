using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using CsvHelper;

namespace Bitbash.MailTool;

public class MailMergeInputBuilder
{
    private const string AttendingStatus = "Attending";
    
    private readonly string _workingFolder;
    
    public MailMergeInputBuilder(string workingFolder)
    {
        _workingFolder = workingFolder;
    }
    
    public void Build(string formLinkPrefix)
    {
        var attendeeIdsPath = GetFilePath("attendee-ids.json");
        var attendeeIds = AttendeeIdDataStore.Load(attendeeIdsPath);
        
        var attendeesByTicketType = GetAttendees(attendeeIds, formLinkPrefix)
            .GroupBy(a => a.TicketType)
            .ToList();

        foreach (var group in attendeesByTicketType)
        {
            Console.WriteLine($" {group.Key} ({group.Count()})");
            
            WriteMailMergeFile(group.Key, group);
        }

        var uniqueAttendees = attendeesByTicketType
            .SelectMany(g => g)
            .GroupBy(a => a.Email)
            .Select(a => a.First() with { TicketType = "All" });

        WriteMailMergeFile("all", uniqueAttendees);

        attendeeIds.Save(attendeeIdsPath);
    }

    private IEnumerable<AttendeeDto> GetAttendees(AttendeeIdDataStore attendeeIds, string formLinkPrefix)
    {
        var attendees = ReadAttendeesFromExportFile();

        return attendees
            .Select(r => new AttendeeDto
            {
                FirstName = r.FirstName,
                LastName = r.LastName,
                Email = r.Email,
                TicketType = r.TicketType,
                AnonymousId = attendeeIds.GetId(r.Email),
                FormLink = formLinkPrefix + attendeeIds.GetId(r.Email)
            })
            .ToList();
    }

    private IEnumerable<EventbriteAttendeeDto> ReadAttendeesFromExportFile()
    {
        var attendeeExportPath = GetFilePath("attendee-export.csv");
        using var reader = new StreamReader(attendeeExportPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        return csv.GetRecords<EventbriteAttendeeDto>()
            .Where(r => r.Status == AttendingStatus)
            .ToList();
    }
    
    private void WriteMailMergeFile(string ticketType, IEnumerable<AttendeeDto> attendees)
    {
        var mailMergePath = GetFilePath($"mailmerge-{ticketType}.csv");
        using var writer = new StreamWriter(mailMergePath);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        
        csv.WriteRecords(attendees);
    }

    private string GetFilePath(string fileName) => Path.Combine(_workingFolder, NormalizeFileName(fileName));
    
    private string NormalizeFileName(string fileName)
    {
        fileName = Regex.Replace(fileName, @"[^a-zA-Z\-. ]+", "", RegexOptions.Compiled);
        fileName = fileName.ToLowerInvariant();
        fileName = fileName.Replace(' ', '-');
        return fileName;
    }
}