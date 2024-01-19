using Bitbash.MailTool;

switch (args)
{
    case ["mailmerge", _, _]:
        new MailMergeInputBuilder(args[1]).Build(args[2]);
        break;
    case ["results", _]:
        new ResultsBuilder(args[1]).Build();
        break;
    default:
        Console.WriteLine("Usage: Bitbash.MailTool <command> <workingFolder>");
        break;
}