namespace Bitbash.MailTool;

public record ResponseDto
{
    public Guid AttendeeId { get; set; } 

    public string Email { get; set; }
    
    public bool Attending { get; set; }
    
    public string Comments { get; set; } 
}