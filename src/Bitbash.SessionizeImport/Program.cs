﻿using Bitbash.SessionizeImport;

if (args.Length == 3)
{
    var sessionizeImporter = new SessionizeImporter(new HttpClient());
    await sessionizeImporter.ImportAsync(args[0], args[1], args[2]);
}
else
{
    Console.WriteLine("Usage: Bitbash.SessionizeImport <sessionizeApiId> <edition> <websitePath>");
}
