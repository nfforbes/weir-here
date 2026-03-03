namespace WeirHere.Maui.Services;

public static class Config
{
    public static string ApiBaseUrl { get; set; } =
#if DEBUG
        "http://localhost:3000";
#else
        "https://your-production-api.netlify.app";
#endif

    public static string Auth0Domain { get; set; } = "";
    public static string Auth0ClientId { get; set; } = "";
    public static string Auth0Audience { get; set; } = "";
}
