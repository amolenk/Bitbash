using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using CsvHelper;

namespace Bitbash.MailTool;

public class ResultsBuilder
{
    private readonly string _workingFolder;
    
    public ResultsBuilder(string workingFolder)
    {
        _workingFolder = workingFolder;
    }
    
    public void Build()
    {
        var attendeeIdsPath = GetFilePath("attendee-ids.json");
        var attendeeIds = AttendeeIdDataStore.Load(attendeeIdsPath);

        var responses = GetFormResponsesAttendees(attendeeIds);

        WriteResultsFile(responses);
    }

    private IEnumerable<ResponseDto> GetFormResponsesAttendees(AttendeeIdDataStore attendeeIds)
    {
        var responses = ReadResponsesFromExportFile();

        return responses
            .Select(r => new ResponseDto()
            {
                AttendeeId = Guid.Parse(r.RegistrationId),
                Email = attendeeIds.GetEmail(Guid.Parse(r.RegistrationId)),
                Attending = r.AttendanceResponse.StartsWith("Yes"),
                Comments = r.Comments
            })
            .ToList();
    }

    private IEnumerable<GoogleFormsResponseDto> ReadResponsesFromExportFile()
    {
        var responsesExportPath = GetFilePath("form-responses.csv");
        using var reader = new StreamReader(responsesExportPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        return csv.GetRecords<GoogleFormsResponseDto>()
            .ToList();
    }
    
    private void WriteResultsFile(IEnumerable<ResponseDto> responses)
    {
        var resultsPath = GetFilePath("results.csv");
        using var writer = new StreamWriter(resultsPath);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        
        csv.WriteRecords(responses);
    }

    private string GetFilePath(string fileName) => Path.Combine(_workingFolder, fileName);
}