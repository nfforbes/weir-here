using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace WeirHere.Maui.Services;

public class ApiService : IApiService
{
    private readonly HttpClient _http;
    private string? _token;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ApiService()
    {
        _http = new HttpClient
        {
            BaseAddress = new Uri(Config.ApiBaseUrl.TrimEnd('/') + "/"),
            Timeout = TimeSpan.FromSeconds(30)
        };
        _http.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "application/json");
    }

    public void SetToken(string? token)
    {
        _token = token;
        _http.DefaultRequestHeaders.Remove("Authorization");
        if (!string.IsNullOrEmpty(token))
            _http.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", "Bearer " + token);
    }

    private async Task<T?> RequestAsync<T>(HttpMethod method, string path, object? body, CancellationToken cancellationToken)
    {
        var url = path.TrimStart('/');
        var request = new HttpRequestMessage(method, url);
        if (body != null && (method == HttpMethod.Post || method == HttpMethod.Put))
            request.Content = new StringContent(JsonSerializer.Serialize(body, JsonOptions), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var content = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"API {method} {path} failed ({(int)response.StatusCode}): {content}");

        if (string.IsNullOrWhiteSpace(content))
            return default;

        return JsonSerializer.Deserialize<T>(content, JsonOptions);
    }

    public Task<T?> GetAsync<T>(string path, Dictionary<string, string>? query = null, CancellationToken cancellationToken = default)
    {
        if (query != null && query.Count > 0)
        {
            var qs = string.Join("&", query.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));
            path = path.Contains('?') ? path + "&" + qs : path + "?" + qs;
        }
        return RequestAsync<T>(HttpMethod.Get, path, null, cancellationToken);
    }

    public Task<T?> PostAsync<T>(string path, object? body = null, CancellationToken cancellationToken = default)
        => RequestAsync<T>(HttpMethod.Post, path, body, cancellationToken);

    public Task<T?> PutAsync<T>(string path, object? body = null, CancellationToken cancellationToken = default)
        => RequestAsync<T>(HttpMethod.Put, path, body, cancellationToken);
}
