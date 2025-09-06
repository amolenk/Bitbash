# Bitbash Conference Website

Bitbash is a dual-technology repository containing a conference website with two separate applications: a C# ASP.NET Core 8.0 web application (main site) and a React/Next.js application (auxiliary).

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build
- **CRITICAL**: Always use timeouts of 60+ minutes for build commands. Builds may take up to 15 minutes. NEVER CANCEL.
- Install prerequisites:
  - .NET 8.0 SDK (pre-installed, verify with `dotnet --version`)
  - Node.js 20+ with npm (pre-installed, verify with `node --version`)

### C# ASP.NET Core Application (Main Bitbash Site)
- Location: `src/` folder
- Main project: `src/Bitbash.Web/Bitbash.Web.csproj`
- Build commands:
  - `cd src && dotnet restore` -- takes ~2 seconds
  - `cd src && dotnet build` -- takes ~3 seconds for Debug, ~12 seconds for Release. NEVER CANCEL. Set timeout to 60+ minutes.
  - `cd src && dotnet build --configuration Release` -- for production builds
- Run the application:
  - `cd src/Bitbash.Web && dotnet run` -- starts on http://localhost:5262
  - `cd src/Bitbash.Web && dotnet run --configuration Release` -- for production mode
- Clean: `cd src && dotnet clean` -- takes ~1 second

### React/Next.js Application (Auxiliary)
- Location: `src-react/` folder
- Build commands:
  - `cd src-react && npm install` -- takes ~16 seconds for fresh install. NEVER CANCEL. Set timeout to 60+ minutes.
  - `cd src-react && npm run build` -- takes ~14 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
  - **CRITICAL**: Google Fonts connectivity issue - builds fail in restricted network environments with "Failed to fetch Geist from Google Fonts" error. This is expected in sandboxed environments.
- Run the application:
  - `cd src-react && npm run dev` -- starts on http://localhost:3000
- Linting: `cd src-react && npm run lint` -- takes ~2 seconds

## Validation

### Manual Application Testing
- **ALWAYS manually validate applications after making changes**
- **C# Application Validation**:
  - Start: `cd src/Bitbash.Web && dotnet run`
  - Navigate to http://localhost:5262
  - Verify: Beautiful "Jurassic Edition" themed conference website loads
  - Check: Navigation menu (Home, Agenda, Speakers, Tickets) works
  - Verify: Countdown timer displays correctly
  - Test: All sections render (About, Venue, Organizers)
- **Next.js Application Validation**:
  - Start: `cd src-react && npm run dev`
  - Navigate to http://localhost:3000
  - Verify: Standard Next.js welcome page loads with logo and links

### Build Validation Steps
- Always run the following validation sequence after changes:
  1. `cd src && dotnet build --configuration Release` -- NEVER CANCEL, set 60+ minute timeout
  2. `cd src-react && npm run lint` -- quick syntax check
  3. If network allows: `cd src-react && npm run build` -- NEVER CANCEL, set 60+ minute timeout
  4. Manually test both applications as described above

## Known Issues and Workarounds

### Network Restrictions
- **Google Fonts**: Next.js build fails in restricted environments due to Google Fonts fetching
- **Workaround**: Builds work fine in environments with internet access
- **For testing in restricted environments**: Temporarily remove Google Fonts imports from `src-react/app/layout.tsx`

### Build Warnings
- .NET build shows 2 nullable reference warnings in `SessionizeImporter.cs` - these are expected and non-critical
- Next.js shows cache warnings - these are informational only

## Key Projects and Structure

### Repository Structure
```
/
├── src/                           # C# ASP.NET Core application (main site)
│   ├── Bitbash.sln               # Visual Studio solution
│   ├── Bitbash.Web/              # Main web application project
│   ├── Bitbash.Models/           # Shared models
│   └── Bitbash.SessionizeImport/ # Conference data import utility
├── src-react/                    # React/Next.js application
│   ├── app/                      # Next.js app directory
│   ├── package.json              # Node.js dependencies
│   └── next.config.ts            # Next.js configuration
└── .github/workflows/            # CI/CD pipeline
```

### Important Configuration Files
- `src/Bitbash.Web/appsettings.json` -- Conference configuration (dates, tickets, speakers)
- `src/Bitbash.Web/Program.cs` -- Application startup and services
- `src-react/package.json` -- Node.js scripts and dependencies

## Frequently Used Commands Reference

### List repository root contents
```
ls -la /path/to/Bitbash/
.
..
.git
.github
.gitignore
README.md
src
src-react
```

### Check .NET version and SDKs
```
dotnet --version
# Output: 8.0.119

dotnet --list-sdks
# Output: 8.0.119 [/usr/lib/dotnet/sdk]
```

### Check Node.js version
```
node --version
# Output: v20.19.4

npm --version  
# Output: 10.8.2
```

### Main .NET solution projects
```
cd src && dotnet sln list
# Output:
# Bitbash.Models/Bitbash.Models.csproj
# Bitbash.SessionizeImport/Bitbash.SessionizeImport.csproj
# Bitbash.Web/Bitbash.Web.csproj
```

## CI/CD Information
- GitHub Actions workflow: `.github/workflows/main_bitbash.yml`
- Builds on Windows runners for Azure deployment
- Only builds the .NET application (not the React app)
- Targets Azure Web Apps platform

## Time Expectations
- .NET restore: ~2 seconds
- .NET build (Debug): ~3 seconds  
- .NET build (Release): ~12 seconds
- .NET clean: ~1 second
- Node.js install: ~16 seconds
- Next.js build: ~14 seconds (when network accessible)
- Next.js lint: ~2 seconds
- Application startup: ~2-3 seconds each

**REMEMBER**: Always use 60+ minute timeouts for build commands and 30+ minutes for other commands. NEVER CANCEL long-running operations.