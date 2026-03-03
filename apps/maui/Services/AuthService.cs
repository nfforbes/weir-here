namespace WeirHere.Maui.Services;

public class AuthService : IAuthService
{
    private const string TokenKey = "weir_here_token";
    private readonly IApiService _apiService;
    private string? _cachedToken;

    public AuthService(IApiService apiService)
    {
        _apiService = apiService;
    }

    public bool IsAuthenticated => !string.IsNullOrEmpty(_cachedToken);

    public async Task<string?> GetTokenAsync(CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrEmpty(_cachedToken))
            return _cachedToken;
        _cachedToken = await SecureStorage.Default.GetAsync(TokenKey).ConfigureAwait(false);
        return _cachedToken;
    }

    public async Task<bool> LoginAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(Config.Auth0Domain) || string.IsNullOrEmpty(Config.Auth0ClientId))
        {
            _cachedToken = "dev-token";
            await SecureStorage.Default.SetAsync(TokenKey, _cachedToken).ConfigureAwait(false);
            _apiService.SetToken(_cachedToken);
            return true;
        }

        var redirectUri = "weirhere://callback";
        var state = Guid.NewGuid().ToString("N");
        var authUrl = $"https://{Config.Auth0Domain}/authorize?" +
            $"client_id={Uri.EscapeDataString(Config.Auth0ClientId)}" +
            "&response_type=code" +
            "&scope=openid profile email offline_access" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            $"&state={state}";

        if (!string.IsNullOrEmpty(Config.Auth0Audience))
            authUrl += $"&audience={Uri.EscapeDataString(Config.Auth0Audience)}";

        try
        {
            var result = await WebAuthenticator.Default.AuthenticateAsync(
                new Uri(authUrl),
                new Uri(redirectUri),
                cancellationToken).ConfigureAwait(false);

            if (result?.Properties == null || !result.Properties.TryGetValue("code", out var code) || string.IsNullOrEmpty(code))
                return false;

            var tokenEndpoint = $"https://{Config.Auth0Domain}/oauth/token";
            using var client = new HttpClient();
            var form = new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["client_id"] = Config.Auth0ClientId,
                ["code"] = code,
                ["redirect_uri"] = redirectUri
            };
            var req = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint)
            {
                Content = new FormUrlEncodedContent(form)
            };
            var tokenRes = await client.SendAsync(req, cancellationToken).ConfigureAwait(false);
            var json = await tokenRes.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            if (!tokenRes.IsSuccessStatusCode)
                return false;

            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var accessToken = doc.RootElement.TryGetProperty("access_token", out var at) ? at.GetString() : null;
            if (string.IsNullOrEmpty(accessToken))
                return false;

            _cachedToken = accessToken;
            await SecureStorage.Default.SetAsync(TokenKey, accessToken).ConfigureAwait(false);
            _apiService.SetToken(accessToken);
            return true;
        }
        catch (TaskCanceledException)
        {
            return false;
        }
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        _cachedToken = null;
        SecureStorage.Default.Remove(TokenKey);
        _apiService.SetToken(null);

        if (!string.IsNullOrEmpty(Config.Auth0Domain) && !string.IsNullOrEmpty(Config.Auth0ClientId))
        {
            var returnTo = "weirhere://callback";
            var logoutUrl = $"https://{Config.Auth0Domain}/v2/logout?client_id={Uri.EscapeDataString(Config.Auth0ClientId)}&returnTo={Uri.EscapeDataString(returnTo)}";
            try
            {
                await WebAuthenticator.Default.AuthenticateAsync(new Uri(logoutUrl), new Uri(returnTo), cancellationToken).ConfigureAwait(false);
            }
            catch
            {
                // Ignore logout redirect errors
            }
        }
    }
}
