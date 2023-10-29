using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Bitbash.Website.Components;
using Bitbash.Services;
using Bitbash.Configuration;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped<EventDetailsProvider>();

var settings = new WebsiteSettings();
builder.Configuration.Bind(settings);
builder.Services.AddSingleton(settings);

await builder.Build().RunAsync();
