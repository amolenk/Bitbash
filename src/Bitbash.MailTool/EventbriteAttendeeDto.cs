using CsvHelper.Configuration.Attributes;

namespace Bitbash.MailTool;

public record EventbriteAttendeeDto
{
    [Name("First Name")] 
    public string FirstName { get; set; } 
    
    [Name("Last Name")] 
    public string LastName { get; set; } 
    
    public string Email { get; set; } 

    [Name("Ticket Type")] 
    public string TicketType { get; set; } 

    [Name("Attendee Status")]
    public string Status { get; set; }
    
    [Ignore]
    public Guid AnonymousId { get; set; }
}