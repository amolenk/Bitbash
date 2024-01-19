using System.Text.Json;

namespace Bitbash.MailTool;

public class AttendeeIdDataStore
{
    private readonly Dictionary<string, Guid> _ids;
    
    private AttendeeIdDataStore(Dictionary<string, Guid> ids)
    {
        _ids = ids;
    }

    public static AttendeeIdDataStore Load(string path)
    {
        if (!File.Exists(path))
        {
            return new AttendeeIdDataStore(new Dictionary<string, Guid>());
        }
        
        var json = File.ReadAllText(path);
        var ids = JsonSerializer.Deserialize<Dictionary<string, Guid>>(json);
        return new AttendeeIdDataStore(ids!);
    }
    
    public void Save(string path)
    {
        var json = JsonSerializer.Serialize(_ids);
        File.WriteAllText(path, json);
    }

    public Guid GetId(string email)
    {
        if (_ids.TryGetValue(email, out var id))
        {
            return id;
        }
        
        id = Guid.NewGuid();
        _ids.Add(email, id);

        return id;
    }

    public string GetEmail(Guid id)
    {
        return _ids.FirstOrDefault(kvp => kvp.Value == id).Key;
    }
}