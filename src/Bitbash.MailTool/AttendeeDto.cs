using CsvHelper.Configuration.Attributes;

namespace Bitbash.MailTool;

public record AttendeeDto
{
    public Guid AnonymousId { get; set; }

    public string FirstName { get; set; } 
    
    public string LastName { get; set; } 
    
    public string Email { get; set; } 
    
    [Ignore]
    public string TicketType { get; set; } 
    
    public string FormLink { get; set; }
}