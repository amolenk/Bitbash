using Bitbash.Web.Configuration;
using Bitbash.Web.Components;
using Bitbash.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddSingleton<EventDetailsProvider>();
builder.Services.AddHttpContextAccessor();

var settings = new WebsiteSettings();
builder.Configuration.GetSection("Bitbash").Bind(settings);
builder.Services.AddSingleton(settings);

var app = builder.Build();

// Allow embedding in iframes for the /up-next page
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/up-next")
    {
        context.Response.Headers["X-Frame-Options"] = "ALLOWALL";
    }
    await next();
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();