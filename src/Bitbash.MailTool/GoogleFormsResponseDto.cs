using CsvHelper.Configuration.Attributes;

namespace Bitbash.MailTool;

public record GoogleFormsResponseDto
{
    [Name("Can you attend Bitbash in-person?")] 
    public string AttendanceResponse { get; set; } 
    
    [Name("Registration ID (please do not change!)")] 
    public string RegistrationId { get; set; } 
    
    [Name("Comments and/or questions")] 
    public string Comments { get; set; } 
}